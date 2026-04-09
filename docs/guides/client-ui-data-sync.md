# Client UI data sync

This document defines how writable client surfaces stay in sync with server
state after a mutation.

## Revalidation for server-first forms

When a writable route is server-first, the correct flow is:

1. A form island submits to a Server Action (via `useActionForm`)
2. The Server Action writes to the database
3. The Server Action calls `revalidatePath()`
4. The server re-runs the route tree
5. The parent Server Component passes new props into the form island
6. The form island re-syncs through the `values` option in `useActionForm`

This replaces client-side `router.refresh()` calls entirely for settings-style
forms.

## Revalidation rules

- Server-first writable routes use `revalidatePath()` in the action body
- Variant B form islands never call `router.refresh()`
- Form islands use `values`, not `useEffect`, `reset()`, or `useTransition`
- Field-level validation errors come from the next-safe-action adapter

## When `router.refresh()` is allowed

Only when a Server Action is architecturally inappropriate:

- Browser auth SDK flows (Supabase Auth sign-in, OAuth)
- WebSocket or other browser-owned mutation transports

When it is needed, wrap it in `startTransition`.

## TanStack Query client surfaces

For client surfaces that need reactive state (data tables, real-time lists),
generated read-only **query hooks** (`use-*-query.hook.codegen.ts`) can be
used. These query hooks fetch data via Server Actions inside `queryFn`.

Even on these surfaces, mutations **still go through Server Actions**, not
mutation hooks. After a write, call `revalidatePath()` in the Server Action,
then invalidate the relevant query keys from the form island's `onSuccess`
callback if the client cache needs to reflect the change before the next RSC
refresh.

## What does not exist

- **Mutation hooks** (`use-*-mutation.hook.codegen.ts`) — do not exist in
  this codebase and must not be created. Mutations always go through Server
  Actions.
