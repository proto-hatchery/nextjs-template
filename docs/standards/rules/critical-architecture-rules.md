> **Contributors without Cursor:** Same rule as
> [`.cursor/rules/critical-architecture-rules.mdc`](../../../.cursor/rules/critical-architecture-rules.mdc).
> Regenerate: `node scripts/ci/sync-cursor-rules-to-docs.mjs`.

---

# ⚠️ CRITICAL ARCHITECTURE RULES

**THESE ARE NON-NEGOTIABLE. IF YOU VIOLATE THESE, YOUR CODE WILL BE REJECTED.**

---

## 🚫 RULE #1: Server Actions Location

**MUST live in:** `packages/supabase-data/src/actions/{module}/`

**MUST NOT live in:** `apps/*/actions/`, `apps/*/lib/`, `apps/*/lib/db/`

### If You See This → INSTANT REJECT

```typescript
// ❌ apps/example/actions/create-user.ts
// 🚫 THIS FILE SHOULD NOT EXIST
// 🚫 DELETE IMMEDIATELY

'use server'
import { authActionClient } from "@workspace/safe-action"

export const createUser = authActionClient
  .inputSchema(...)
  .action(...)
```

### Do This Instead → APPROVE

```typescript
// ✅ packages/supabase-data/src/actions/users/create-user.ts

'use server'
import { authActionClient } from '@workspace/safe-action'

export const createUser = authActionClient
  .inputSchema(...)
  .action(...)
```

```typescript
// ✅ apps/example/app/page.tsx (consuming the action)

import { createUser } from "@workspace/supabase-data/actions/users/create-user"
```

---

## 🚫 RULE #2: next-safe-action v8 Syntax

**MUST use:** `.inputSchema()`

**MUST NOT use:** `.schema()` (DEPRECATED)

### If You See This → REQUEST CHANGES

```typescript
export const myAction = authActionClient
  .schema(z.object({...}))  // ❌ DEPRECATED!
  .action(...)
```

**Comment:** "Use `.inputSchema()` not `.schema()` — deprecated in v8. See
docs/tools/zod-v4-patterns.md"

### Do This Instead → APPROVE

```typescript
export const myAction = authActionClient
  .inputSchema(z.object({...}))  // ✅ CORRECT
  .action(...)
```

---

## 🚫 RULE #3: Zod Validators Must Have `()`

**MUST use:** `z.uuid()`, `z.email()`, `z.url()`

**MUST NOT use:** `z.string().uuid`, `z.email`, `z.url`
(missing parentheses)

### If You See This → REQUEST CHANGES

```typescript
const schema = z.object({
  id: z.string().uuid, // ❌ FUNCTION REFERENCE, NOT VALIDATOR
  email: z.email, // ❌ FUNCTION REFERENCE, NOT VALIDATOR
  website: z.url, // ❌ FUNCTION REFERENCE, NOT VALIDATOR
})
```

**Comment:** "Add `()` to validators: `.uuid()` not `.uuid`. These are function
calls, not properties."

### Do This Instead → APPROVE

```typescript
const schema = z.object({
  id: z.uuid(), // ✅ FUNCTION CALL
  email: z.email(), // ✅ FUNCTION CALL
  website: z.url(), // ✅ FUNCTION CALL
})
```

---

## 🚫 RULE #4: No Server Imports in Client Components

**If file has** `"use client"` directive:

**MUST NOT import:** `@supabase/ssr`, server actions, auth helpers, database
clients

### If You See This → INSTANT REJECT

```typescript
// File with "use client"
"use client"

import { createServerClient } from "@supabase/ssr" // ❌ SERVER IMPORT IN CLIENT!

export function MyComponent() {
  const supabase = createServerClient() // ❌ WILL FAIL AT RUNTIME
  // ...
}
```

**Comment:** "Cannot import server code in client components. Move logic to
Server Action in packages/supabase-data/src/actions/. See
docs/architecture/CRITICAL-RULES.md"

### Do This Instead → APPROVE

```typescript
// ✅ Server Action (in packages/)
// File: packages/supabase-data/src/actions/users/get-profile.ts
"use server"

import { createServerClient } from "@supabase/ssr"

export async function getProfile() {
  const supabase = createServerClient()
  return supabase.from("profiles").select().single()
}
```

```typescript
// ✅ Client Component (in apps/)
// File: apps/example/components/user-profile.tsx
"use client"

import { getProfile } from "@workspace/supabase-data/actions/users/get-profile"

export function UserProfile() {
  const handleLoad = async () => {
    const profile = await getProfile() // ✅ CALLS SERVER ACTION
    // ...
  }
}
```

---

## 🚫 RULE #5: No Barrel Exports (GR-001)

**MUST NOT create:** `index.ts` files that re-export from other files

### If You See This → REQUEST CHANGES

```typescript
// ❌ packages/supabase-data/src/actions/index.ts
export * from "./users/get-user"
export * from "./profiles/update-profile"
```

```typescript
// ❌ apps/example/app/page.tsx
import { getUser, updateProfile } from "@workspace/supabase-data/actions" // BARREL IMPORT!
```

**Comment:** "Use explicit imports — no barrel exports (GR-001 Zero-Barrel
Policy). Import directly from file paths."

### Do This Instead → APPROVE

```typescript
// ✅ apps/example/app/page.tsx
import { getUser } from "@workspace/supabase-data/actions/users/get-user"
import { updateProfile } from "@workspace/supabase-data/actions/profiles/update-profile"
```

---

## 🚫 RULE #6: Mutation Hooks Do NOT Exist

**MUST NOT create:** `use-*-mutation.hook.codegen.ts` or any TanStack Query
mutation hook for database writes.

**MUST use:** Server Action via `authActionClient` → `revalidatePath()`

### If You See This → INSTANT REJECT

```typescript
// ❌ packages/supabase-data/src/hooks/patients/use-patient-mutation.hook.codegen.ts
// 🚫 THIS FILE SHOULD NOT EXIST

"use client"
import { useMutation } from "@tanstack/react-query"
import { createPatientAction } from "..."

export function useCreatePatientMutation() {
  return useMutation({ mutationFn: createPatientAction, ... })
}
```

**Comment:** "Mutation hooks do not exist. Use `useActionForm` + Server Action.
See docs/architecture/data-access-pattern.md"

### Do This Instead → APPROVE

```typescript
// ✅ apps/example/features/patients/_components/create-patient-form.tsx
"use client"

import { useActionForm } from "@workspace/forms/hooks/use-action-form"
import { createPatientAction } from "@workspace/supabase-data/actions/patients/create-patient"

export function CreatePatientForm({ initialValues }: Props) {
  const { form, handleSubmitWithAction, action } = useActionForm({
    action: createPatientAction,
    schema: createPatientSchema,
    defaultValues: initialValues,
  })
  return (
    <form onSubmit={handleSubmitWithAction}>
      <Button disabled={action.isPending}>Create</Button>
    </form>
  )
}
```

---

## 🚫 RULE #7: authActionClient From `@workspace/safe-action` Only

**MUST import from:** `@workspace/safe-action`

**MUST NOT import from:** `@workspace/supabase-auth/server` or anywhere else

### If You See This → REQUEST CHANGES

```typescript
// ❌ Wrong source
import { authActionClient } from "@workspace/supabase-auth/server"
```

**Comment:** "`authActionClient` must be imported from `@workspace/safe-action` only."

### Do This Instead → APPROVE

```typescript
// ✅ Correct source
import { authActionClient } from "@workspace/safe-action"
```

---

## 📋 Pre-Commit Verification

Before committing ANY code, verify:

```bash
# 1. Check for actions in wrong location
find apps -name "*.ts" -path "*/actions/*"  # Should return NOTHING

# 2. Check for mutation hooks (they do not exist and must not be created)
find packages/supabase-data/src/hooks -name "*mutation*"  # Should return NOTHING

# 3. Check for barrel exports
find . -name "index.ts" -exec grep -l "export \* from" {} \;  # Should return NOTHING

# 4. Run dependency-cruiser
pnpm depcruise apps/*/app packages/*/src --config .dependency-cruiser.cjs

# 5. Run typecheck
pnpm typecheck
```

---

## 🎯 Quick Decision Tree

### "Should I create a new Server Action?"

```
Do you need to expose data/mutation to clients?
│
├─ NO → Keep it internal (repository/service layer in packages/)
│
└─ YES → Create in packages/supabase-data/src/actions/{module}/
         │
         └─ NEVER in apps/!
```

### "Where do I import from?"

```
Need Server Action? → @workspace/supabase-data/actions/{module}/{file}
Need Query Hook (read)? → @workspace/supabase-data/hooks/{module}/{file}
Need Auth client? → @workspace/safe-action  (authActionClient)
Need Auth helpers? → @workspace/supabase-auth/{module}
Need UI? → @workspace/ui/components/{component}
Need Brand? → @workspace/brand/components/{component}
Need forms? → @workspace/forms/hooks/use-app-form or use-action-form
```

---

## ⚖️ Consequences

| Violation                  | Action                                              |
| -------------------------- | --------------------------------------------------- |
| Action in `apps/`          | **INSTANT REJECT** — Delete file, move to packages/ |
| Using `.schema()`          | **REQUEST CHANGES** — Fix to `.inputSchema()`       |
| Missing `()` on validators | **REQUEST CHANGES** — Add parentheses               |
| Server import in client    | **INSTANT REJECT** — Refactor to Server Action      |
| Barrel export              | **REQUEST CHANGES** — Use explicit imports          |
| Mutation hook file created | **INSTANT REJECT** — Delete file; use Server Action |
| Wrong authActionClient source | **REQUEST CHANGES** — Use `@workspace/safe-action` |
| Using `@tanstack/react-form` | **REQUEST CHANGES** — Use React Hook Form          |

**NO WARNINGS. FIX BEFORE MERGE.**

---

## 📚 Full Documentation

- [`docs/architecture/CRITICAL-RULES.md`](/docs/architecture/CRITICAL-RULES.md)
  — Complete guide with examples
- [`docs/tools/zod-v4-patterns.md`](/docs/tools/zod-v4-patterns.md) — Zod v4
  syntax
- [`docs/tools/next-safe-action.md`](/docs/tools/next-safe-action.md) —
  next-safe-action patterns
- [`docs/standards/golden-rules.md`](/docs/standards/golden-rules.md) — GR-001
  (Zero-Barrel)
- [`.cursor/rules/actions-location.mdc`](/.cursor/rules/actions-location.mdc) —
  Action location rule

---

**AI AGENT INSTRUCTION:** If you generate code that violates these rules, you
MUST fix it immediately. Do not suggest violations. Do not make excuses. Fix it.
