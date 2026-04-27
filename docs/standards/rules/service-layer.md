> **Contributors without Cursor:** Same rule as
> [`.cursor/rules/service-layer.mdc`](../../../.cursor/rules/service-layer.mdc).
> Regenerate: `node scripts/ci/sync-cursor-rules-to-docs.mjs`.

---

# Business Logic Placement

**Canonical doc:**
[docs/architecture/business-logic-placement.md](../../docs/architecture/business-logic-placement.md)

## The rule in one sentence

If logic is reusable across two apps or two contexts, it belongs in
`packages/supabase-data/src/modules/{domain}/domain/services/`. If it is
exclusively UI orchestration (`revalidatePath`, `redirect`, `toast`), it stays
in `apps/*/app/**/_actions/*.action.ts`.

## Decision tree

```
Does this logic involve business rules, merge operations, or
coordination across two or more repositories?
├─ YES, and it could be used by more than one app?
│  └─ → Domain service (packages/supabase-data/…/domain/services/)
├─ YES, but strictly UI-specific (revalidatePath, redirect)?
│  └─ → App-local action (_actions/*.action.ts)
└─ NO — it is a single unconditional CRUD?
   └─ → Call the generated action directly from the app-local action
```

## Layer responsibilities

| Layer                | File pattern                                                        | Responsibility                         | Can contain business logic? |
| -------------------- | ------------------------------------------------------------------- | -------------------------------------- | --------------------------- |
| App page / component | `apps/*/app/**/*.{tsx,ts}`                                          | Render, routing                        | ❌                          |
| App-local action     | `apps/*/**/_actions/*.action.ts`                                    | inputSchema → service → revalidatePath | ❌                          |
| Domain service       | `packages/supabase-data/src/modules/*/domain/services/*.service.ts` | Shareable business logic               | ✅                          |
| Generated action     | `packages/supabase-data/src/actions/*.codegen.ts`                   | Auth + Zod + repository                | ❌ (generated)              |
| Repository           | `packages/supabase-data/src/modules/*/infrastructure/repositories/` | Raw SQL via Supabase SDK               | ❌ (generated)              |

## Service rules (non-negotiable)

```ts
// ✅ REQUIRED at the top of every service file
import "server-only"

// ✅ Receives userId as an argument — never calls getClaims() itself
export async function doSomething(userId: string, input: SomeInput): Promise<void> { … }

// ❌ FORBIDDEN in services
import { revalidatePath } from "next/cache"    // Next.js coupling
import { redirect } from "next/navigation"     // Next.js coupling
import { headers } from "next/headers"         // Next.js coupling
```

## App-local action rules

```ts
// ✅ Thin orchestrator — three logical steps only
export const myAction = authActionClient
  .inputSchema(schema)
  .action(async ({ parsedInput, ctx }) => {
    await doSomething(ctx.userId, parsedInput)         // 1. call service
    revalidatePath("/[locale]/something", "layout")   // 2. invalidate cache
    return { success: true }                           // 3. return
  })

// ❌ FORBIDDEN in app-local actions
const existing = await listEntityAction(…)            // business I/O
const merged = { ...existing, ...parsedInput }        // merge logic
if (existing) { await update(…) } else { await insert(…) }  // branching
```

## Package export

Every service must be exported via `packages/supabase-data/package.json`:

```json
"./modules/{domain}/domain/services/{name}":
  "./src/modules/{domain}/domain/services/{name}.service.ts"
```

## CI enforcement

- `pnpm check:service-layer` — fails if a service file lacks
  `import "server-only"` or imports from `"next/"`.
- `pnpm check:forbidden` — fails if `"use server"` appears in a service file.
- `pnpm check:workspace-imports` — fails if any `packages/` file imports from
  `apps/`.

---

**Rule ID:** SERVICE-LAYER **Severity:** CRITICAL **Full docs:**
[docs/architecture/business-logic-placement.md](../../docs/architecture/business-logic-placement.md)
