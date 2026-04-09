# Data access pattern

This document defines how writable UI reaches the database in this template.

## Architecture overview

### Write path (all writable routes)

```
RHF form (useAppForm / useActionForm)
  → useAction (next-safe-action/hooks)
  → app-local *.action.ts  (thin orchestrator, lives in apps/)
  → generated Server Action  (@workspace/supabase-data/actions/*)
  → revalidatePath()
```

All mutations go through Server Actions. There is no client-side mutation hook
layer. Generated mutation hooks do not exist in this codebase and must not be
created.

### Read path (all readable routes)

Server Components fetch data directly via generated Server Actions from
`@workspace/supabase-data/actions/*`. Generated query hooks (`use-*-query.hook.codegen.ts`)
are read-only infrastructure available for client surfaces that require live
reactive state (e.g. tables, real-time lists). They are not the primary fetch
mechanism for server-first pages.

## Form system

The only form library is **React Hook Form**.

| Hook | Use case |
|------|----------|
| `useAppForm` from `@workspace/forms/hooks/use-app-form` | Browser SDK forms (auth, OAuth) |
| `useActionForm` from `@workspace/forms/hooks/use-action-form` | Server Action forms (settings, configuration, all writable server-first pages) |

`@tanstack/react-form` must not be used.

## Mutation transport

### Server-first routes (settings, preferences, profile, configuration)

Use: `useActionForm` → `authActionClient` (from `@workspace/safe-action`) → `revalidatePath()`

Do not use: `router.refresh()` on the client, TanStack Query mutation hooks.

The Server Action writes to the database and calls `revalidatePath()` in the
same request. The RSC tree re-runs on the server. The form island re-syncs via
the `values` option in `useActionForm`. This is one network round trip.

### When `router.refresh()` is correct

Only when a Server Action is architecturally inappropriate:

1. Browser auth SDK flows (Supabase Auth sign-in, OAuth handoff)
2. WebSocket or other browser-owned mutation transports
3. Wrap in `startTransition(() => router.refresh())`

### When `setQueryData` or optimism is correct

Only for client surfaces (not settings forms) where:

1. A TanStack Query subscriber is mounted and watching the mutated entity
2. Rollback on error is trivial and the user benefit of instant feedback
   outweighs the implementation cost
3. The mutation still goes through a Server Action — not a mutation hook

## Revalidation rules

- Server-first writable routes use `revalidatePath()` inside the Server Action body
- Variant B form islands never call `router.refresh()`
- Form islands use `values` (not `useEffect`, `reset()`, or `useTransition`)
- Field-level validation errors come from the next-safe-action adapter

## What does NOT exist

- **Mutation hooks** (`use-*-mutation.hook.codegen.ts`) — do not exist, must not be
  created, and must not be regenerated. The codegen pipeline does not emit them.
- **Dual mutation patterns** — there is one path: Server Action via `authActionClient`.
