# Golden Rules

**These rules are NON-NEGOTIABLE. All code MUST follow these rules. Violations
MUST be fixed before merge.**

---

## GR-001: Zero-Barrel Policy

**Rule:** NEVER create or use barrel files (`index.ts` that re-exports from
other files).

**Why:**

- Hidden dependencies
- Poor tree-shaking
- Unclear import sources
- Circular dependency risks

**Enforcement:** Oxlint `no-restricted-imports` (error)

**Correct:**

```typescript
import { Button } from "@workspace/ui/components/button"
import { useTask } from "@workspace/supabase-data/hooks/tasks/use-task"
import { logServerEvent } from "@workspace/logging/server"
```

**Incorrect:**

```typescript
import { Button } from "@workspace/ui"
import { useTask } from "@workspace/supabase-data"
import { logServerEvent } from "@workspace/logging"
```

**AI Agent Instruction:** If you see a barrel import, fix it immediately. Never
suggest barrel imports.

---

## GR-002: File Size Limit

**Rule:** No component file may exceed **250 lines**. Warning at 200 lines,
error at 250.

**Why:**

- High cognitive load
- Side-effect coupling
- Poor maintainability
- Difficult testing

**Enforcement:** Code review + pre-commit hook

**Action:** Extract presentational pieces into separate components when
approaching limit.

**Structure:**

```
app/dashboard/
├── page.tsx (max 250 lines)
└── _components/
    ├── stats-card.tsx
    ├── recent-activity.tsx
    └── dashboard-header.tsx
```

---

## GR-003: Private Directory Convention

**Rule:** Route-local code MUST live in underscore-prefixed directories:
`_components`, `_hooks`, `_utils`, `_providers`.

**Why:**

- Clear ownership
- Prevents accidental imports from other routes
- Enforces encapsulation

**Enforcement:** Oxlint `no-restricted-imports`

**Correct:**

```typescript
// ✅ Can import from _components (same route)
import { DashboardHeader } from "./_components/dashboard-header"
```

**Incorrect:**

```typescript
// ❌ Cannot import from other route's _components
import { DashboardHeader } from "../dashboard/_components/dashboard-header"
```

---

## GR-005: No Console in Production

**Rule:** Raw `console.log`, `console.warn`, `console.error`, `console.info`,
and `console.debug` are **BANNED** in product code.

**Why:**

- Bypasses correlation ID tracking
- Bypasses metadata redaction
- Bypasses event semantics
- Leaks sensitive data

**Enforcement:** Oxlint `no-console` (error)

**Correct:**

```typescript
import { logServerEvent } from "@workspace/logging/server"

await logServerEvent({
  component: "my.component",
  eventFamily: "action.lifecycle",
  eventName: "operation_completed",
  outcome: "success",
  service: "my-service",
})
```

**Incorrect:**

```typescript
console.log("Operation completed") // BANNED
```

**Exception:** CLI scripts that are not part of product runtime code.

---

## GR-014: UI Package is CLI-Generated Only

**Rule:** NEVER manually edit files under `packages/ui/src/components/`.

**Why:**

- shadcn components must remain pristine for easy upgrades
- Prevents merge conflicts in monorepo
- Ensures consistency across apps

**Enforcement:** Pre-commit hook + CI check

**Correct:**

```bash
# Add components via CLI
pnpm dlx shadcn@latest add button -c packages/ui
pnpm dlx shadcn@latest add dialog -c packages/ui
```

**Incorrect:**

```bash
# Never manually edit shadcn files
# Never create custom components in packages/ui/src/components/
```

**Custom Components:** Create in `@workspace/brand` or app-specific
`_components/`.

---

## GR-015: CLI-Generated Migrations Only

**Rule:** **NEVER create new files under `supabase/migrations/` without
`pnpm supabase:migration:new -- <name>`.**

**Why:**

- Hand-made paths cause timestamp collisions
- Unstamped files bypass safety checks
- Inconsistent metadata

**Enforcement:** Pre-commit hook + CI check

**Correct Workflow:**

```bash
# 1. Create migration via CLI
pnpm supabase:migration:new -- create_users_table

# 2. Develop in Supabase Studio SQL Editor

# 3. Capture diff
pnpm supabase db diff -o supabase/migrations/YYYYMMDDHHMMSS_create_users_table.sql

# 4. Verify
pnpm supabase:migrations:verify

# 5. Test RLS
pnpm test:rls
```

**Incorrect:**

```bash
# NEVER do this
touch supabase/migrations/manual.sql
```

**AI Agent Restrictions:**

- NEVER suggest creating SQL files without the CLI command
- NEVER provide SQL to paste into a hand-made migration path
- ALWAYS instruct: `migration:new` first, then `db diff -o`

---

## GR-017: Server Actions Boundary

**Rule:** All Server Actions MUST use `next-safe-action` with proper validation
and error handling.

**Why:**

- Type-safe action definitions with Zod schemas
- Automatic error handling and serialization
- Built-in authentication middleware support
- Consistent action patterns across the codebase
- AI-friendly type inference for better autocomplete

**Enforcement:** TypeScript + code review

**Correct:**

```typescript
"use server"

import { authActionClient } from "@workspace/safe-action"
import { z } from "zod"

export const myAction = authActionClient
  .schema(
    z.object({
      title: z.string().min(1),
      description: z.string().optional(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    // ctx.userId is available from auth middleware
    const { title, description } = parsedInput

    // Your action logic here
    return {
      success: true,
      data: { id: "example-id", title, description },
    }
  })
```

**Incorrect:**

```typescript
// NEVER use raw Server Actions without next-safe-action
async function myAction(input: Input) {
  if (!user) throw new Error("Unauthorized") // BANNED
}
```

**Action Clients:**

- `actionClient` - Base client for public actions
- `authActionClient` - Client with authentication middleware (requires logged-in
  user)

**See:** [`docs/tools/next-safe-action.md`](../tools/next-safe-action.md) for
complete guide.

---

## GR-019: Three-Level Documentation

**Rule:** Documentation MUST follow three-level structure.

**Levels:**

**Level 1 — Template & Standards** (`docs/`)

- Repository standards
- ADR templates
- Coding standards
- Golden Rules
- Architecture overview

**Level 2 — Cross-App Business** (`apps/docs/`)

- Product overview
- Marketplace rules
- Trust & safety
- Operations guides

**Level 3 — Single-App Domain** (`apps/<app>/docs/`)

- App-specific domain docs
- Feature notes
- SEO documentation

**Why:**

- Clear scope boundaries
- Prevents duplication
- Easy to maintain

---

## GR-020: English Only (Code & Comments)

**Rule:** ALL code, comments, and technical writing MUST be in **English**.

**Why:**

- International collaboration
- Industry standard
- AI tools trained on English code
- Open source contributions

**Enforcement:** Code review

**Correct:**

```typescript
// Calculate user's subscription expiry date
const expiryDate = calculateExpiryDate(startDate, duration)
```

**Incorrect:**

```typescript
// Calcular data de expiração do usuário (Portuguese)
const expiryDate = calculateExpiryDate(startDate, duration)
```

**Exception:** UI text can be translated via `next-intl`.

---

## Pre-Commit Checklist

Before every commit, run:

```bash
# 1. Workflow (mandatory)
pnpm workflow              # lint → typecheck → build → format

# 2. Security checks
pnpm check:forbidden
pnpm check:security-smells
pnpm check:docs-drift

# 3. Test (if changed code)
pnpm test:coverage
```

**AI Agent Instruction:** Always remind users to run this checklist before
committing.

---

## Violation Consequences

- **Pre-commit:** Hook blocks commit
- **CI:** Build fails
- **Post-merge:** Must fix within 24 hours

**No exceptions.** These rules exist because they've been battle-tested in
production.

---

## Related (not a GR id)

- **[Package file suffixes](./package-file-suffixes.md)** — `*.component.tsx` /
  `*.hook.*` / `*.provider.tsx` in `packages/brand`, `core`, `forms`, `seo`
  only; enforced by `pnpm check:forbidden`.

---

**Last Updated:** 2026-04-04  
**Version:** 1.0.0  
**Enforcement:** Automated + Human Review
