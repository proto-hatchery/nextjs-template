# Business Logic Placement

> Where complex server-side logic lives, how responsibilities are separated, and
> how the CI enforces these boundaries.

---

## The problem this answers

Every non-trivial feature eventually has logic that goes beyond a single CRUD
call: deciding between insert and update, merging partial updates, coordinating
two repositories, computing derived state from multiple records. This logic
needs a canonical home. Putting it in the wrong layer causes duplication across
apps, untestable code, and architecture drift.

---

## Layer map

```
┌─────────────────────────────────────────────────────────────────────┐
│  PRESENTATION                                                       │
│  apps/*/app/                                                        │
│  • RSC pages, layouts, loading states                               │
│  • Reads via _lib/*-view-model.server.ts                            │
│  • Writes via _actions/*.action.ts (thin orchestrators)             │
│  • NO database calls. NO business logic.                            │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────────┐
│  APP-LOCAL ORCHESTRATION                                            │
│  apps/*/app/**/_actions/*.action.ts                                 │
│  • "use server" + authActionClient + inputSchema                    │
│  • Receives validated input from the form                           │
│  • Calls service (if logic is complex/shared) or generated action   │
│  • Calls revalidatePath() after write                               │
│  • Returns { success: true } or field errors                        │
│  • NO business logic. NO blob manipulation. NO repository calls.    │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ import @workspace/supabase-data/modules/…
┌──────────────────────▼──────────────────────────────────────────────┐
│  DOMAIN SERVICE  (this document's focus)                            │
│  packages/supabase-data/src/modules/{domain}/domain/services/       │
│  • import "server-only" (never "use server")                        │
│  • Shareable business logic: merge, upsert, cross-entity workflows  │
│  • Receives typed inputs; never reads from Next.js context          │
│  • Calls generated actions OR instantiates repositories directly    │
│  • NO revalidatePath. NO redirect. NO Next.js imports.              │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ calls
┌──────────────────────▼──────────────────────────────────────────────┐
│  GENERATED ACTIONS                                                  │
│  packages/supabase-data/src/actions/*.codegen.ts                    │
│  • "use server" + requireAuth + Zod validation + repository         │
│  • One CRUD operation per file                                      │
│  • Auto-generated; do not hand-edit                                 │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ uses
┌──────────────────────▼──────────────────────────────────────────────┐
│  REPOSITORY / INFRASTRUCTURE                                        │
│  packages/supabase-data/src/modules/{domain}/infrastructure/        │
│  • Raw Supabase SDK (.from(), .select(), .insert(), …)              │
│  • Row → DTO mapping via mappers                                    │
│  • Auto-generated; do not hand-edit                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Where does my logic belong?

Work through this decision tree top-to-bottom and stop at the first match.

```
Is this logic reachable from a browser (rendering, display, formatting)?
└─ YES → RSC page or Client Component. It is not server-only logic.

Does it involve any database I/O?
└─ NO → It is a pure utility. Put it near its consumer (app-local _lib/ or a
        shared @workspace/core/utils/ if reused across apps).

Is the I/O a single, unconditional CRUD call with no branching?
└─ YES → Call the generated action directly from the app-local action.
         Do not create a service for this.

Can this logic be used by more than one app, or is it complex enough to be
tested in isolation from Next.js?
└─ YES → Domain service.
         Location: packages/supabase-data/src/modules/{domain}/domain/services/

Does this logic depend on revalidatePath, redirect, or headers()?
└─ YES → It is app-local orchestration. It stays in _actions/*.action.ts.
         Extract only the reusable part into a service; call it from the action.
```

### Summary table

| Scenario                                                  | Location                                |
| --------------------------------------------------------- | --------------------------------------- |
| Multi-step write (fetch → merge → upsert)                 | Service                                 |
| Coordinating two or more repositories                     | Service                                 |
| Business rule (eligibility check, state machine)          | Service                                 |
| Aggregate / projection (build a read model from N tables) | Service                                 |
| Single CRUD with no branching                             | Generated action (called directly)      |
| revalidatePath + redirect + toast                         | App-local `_actions/*.action.ts`        |
| UI state derivation, display formatting                   | RSC or Client Component                 |
| Shared UI helpers across apps                             | `@workspace/core` or `@workspace/brand` |

---

## File structure for a domain service

```
packages/supabase-data/src/modules/{domain}/
  domain/
    dto/
      {entity}.dto.codegen.ts          ← generated (do not edit)
    ports/
      {entity}-repository.port.codegen.ts  ← generated (do not edit)
    services/                          ← hand-authored
      {operation}-{entity}.service.ts
  infrastructure/
    mappers/
      {entity}.mapper.codegen.ts       ← generated
    repositories/
      {entity}-supabase.repository.codegen.ts  ← generated
```

### File naming

| Operation type                | Filename                                                         |
| ----------------------------- | ---------------------------------------------------------------- |
| Create-or-update (upsert)     | `upsert-{entity}.service.ts`                                     |
| Multi-step workflow           | `{verb}-{entity}.service.ts` (e.g. `archive-patient.service.ts`) |
| Read aggregation / projection | `build-{entity}-view.service.ts`                                 |
| Business rule evaluation      | `check-{rule}.service.ts`                                        |

One public responsibility per file. If a file grows beyond ~150 lines, it is
doing more than one thing.

---

## How to write a service

### Minimal skeleton

```ts
// packages/supabase-data/src/modules/orders/domain/services/place-order.service.ts
import "server-only"

import { insertOrderAction } from "@workspace/supabase-data/actions/orders/order-insert.codegen"
import { listInventoryAction } from "@workspace/supabase-data/actions/inventory/inventory-list.codegen"
import type { PlaceOrderInput } from "@workspace/supabase-data/modules/orders/domain/dto/order.dto.codegen"

export async function placeOrder(
  userId: string,
  input: PlaceOrderInput
): Promise<void> {
  // 1. Read what you need
  const inventory = await listInventoryAction({ sku: input.sku })

  // 2. Apply business rule
  if (!inventory.rows.length || inventory.rows[0].stock < input.quantity) {
    throw new Error("Insufficient stock")
  }

  // 3. Write
  await insertOrderAction({
    userId,
    sku: input.sku,
    quantity: input.quantity,
    status: "pending",
  })
}
```

Key points:

- `import "server-only"` at the top — keeps the service out of client bundles
- Receives `userId` (or other identity token) as a plain argument — never calls
  `getClaims()` or `cookies()` itself
- Returns `void` or a plain typed value — never a Next.js response or redirect
- Uses generated actions for I/O, not raw Supabase clients

### When to use the repository directly

Use the generated actions for most writes. Instantiate the repository directly
only when:

- You need to batch multiple writes in a way that the generated actions cannot
  express (e.g. two inserts that must both succeed or both fail)
- You want to skip the Zod re-validation overhead for data already validated at
  the action boundary

```ts
import "server-only"

import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { OrderSupabaseRepository } from "@workspace/supabase-data/modules/orders/infrastructure/repositories/order-supabase.repository.codegen"
import { InventorySupabaseRepository } from "@workspace/supabase-data/modules/inventory/infrastructure/repositories/inventory-supabase.repository.codegen"

export async function transferStock(
  fromId: string,
  toId: string,
  qty: number
): Promise<void> {
  const supabase = await createServerAuthClient()
  const orders = new OrderSupabaseRepository(supabase)
  const inventory = new InventorySupabaseRepository(supabase)

  // both writes inside the same authenticated client scope
  await inventory.update(fromId, {
    stock: (await inventory.findById(fromId))!.stock - qty,
  })
  await inventory.update(toId, {
    stock: (await inventory.findById(toId))!.stock + qty,
  })
}
```

---

## How to call a service from an app-local action

```ts
// apps/web-v1/app/[locale]/(workspace)/orders/_actions/place-order.action.ts
"use server"

import { revalidatePath } from "next/cache"

import { authActionClient } from "@workspace/safe-action"
import { placeOrder } from "@workspace/supabase-data/modules/orders/domain/services/place-order"

import { placeOrderSchema } from "@/app/[locale]/(workspace)/orders/_lib/schemas"

export const placeOrderAction = authActionClient
  .inputSchema(placeOrderSchema)
  .action(async ({ parsedInput, ctx }) => {
    await placeOrder(ctx.userId, parsedInput) // ← service call
    revalidatePath("/[locale]/orders", "layout") // ← Next.js only concern
    return { success: true }
  })
```

The action is responsible for **nothing except**:

1. Declaring the input schema
2. Calling the service (or the generated action for simple cases)
3. Calling `revalidatePath`
4. Returning `{ success: true }` (or field errors)

---

## Exporting from `@workspace/supabase-data`

Services are hand-authored and must be explicitly exported in
`packages/supabase-data/package.json`:

```json
{
  "exports": {
    "./modules/orders/domain/services/place-order": "./src/modules/orders/domain/services/place-order.service.ts"
  }
}
```

Use the subpath convention: `./modules/{domain}/domain/services/{filename}` (no
`.ts` in the key; only in the value).

---

## What a service must NEVER do

| Forbidden                                              | Reason                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| `import { revalidatePath } from "next/cache"`          | Next.js coupling — belongs in the app-local action           |
| `import { redirect } from "next/navigation"`           | Same reason                                                  |
| `import { headers, cookies } from "next/headers"`      | Services receive identity as arguments                       |
| `import anything from "apps/"`                         | Package dependency rules — `packages/` never imports `apps/` |
| `"use server"` directive                               | Services are server modules, not Server Actions              |
| Raw `.from()` calls without going through a repository | Bypasses the data layer contract                             |

---

## What an app-local action must NEVER do

| Forbidden                                               | Reason                                            |
| ------------------------------------------------------- | ------------------------------------------------- |
| Business rule logic (eligibility, merge, state machine) | Belongs in service (not shareable otherwise)      |
| Direct repository calls                                 | Only `@workspace/supabase-data` owns repositories |
| Raw Supabase client instantiation                       | Same — only `supabase-data` has that right        |
| Logic duplicated from another app's `_actions/`         | Extract to service                                |

---

## CI enforcement

Three automated checks enforce these rules.

### 1. `check-workspace-imports` (existing)

Fails if any file under `packages/` or `apps/` uses `../` parent-relative
imports. All cross-package references must use `@workspace/*` or the app alias
`@/`.

### 2. `check-forbidden` (existing, extended)

- `"use server"` is only allowed in:
  - `packages/supabase-data/src/actions/**/*.ts`
  - `apps/*/app/**/_actions/*.action.ts`
- Services (`packages/supabase-data/src/modules/*/domain/services/*.service.ts`)
  must use `import "server-only"`, not `"use server"`.
- `apps/` must never import from other `apps/`.

### 3. `check-service-layer` (new, in this commit)

Checks two rules specific to the service layer:

**Rule A — Services must declare `server-only`.** Any `.service.ts` file under
`packages/supabase-data/src/modules/*/domain/services/` that does not contain
`import "server-only"` fails the check.

**Rule B — Services must not import Next.js.** Any `.service.ts` file under the
same path that imports from `"next/"` fails.

Run manually: `pnpm check:service-layer`

---

## Related documents

- [Backend standards](./backend.md) — repository pattern, auth at the boundary
- [Data access pattern](./data-access-pattern.md) — full read and write paths
- [System layers](./system.md) — package boundaries diagram
- [CRITICAL-RULES.md](./CRITICAL-RULES.md) — non-negotiable rules for PRs
- Cursor rule:
  [`.cursor/rules/service-layer.mdc`](../../.cursor/rules/service-layer.mdc)
- CI script:
  [`scripts/ci/check-service-layer.mjs`](../../scripts/ci/check-service-layer.mjs)
