> **Contributors without Cursor:** Same rule as
> [`.cursor/rules/client-data-sync-optimistic.mdc`](../../../.cursor/rules/client-data-sync-optimistic.mdc).
> Regenerate: `node scripts/ci/sync-cursor-rules-to-docs.mjs`.

---

# Client data sync and optimistic UI

When implementing or integrating **Server Actions**, **API calls**, or
**`@workspace/supabase-data` query hooks** in app UI:

## Required mindset

1. **No manual refresh** — After create/update/delete, visible lists and detail
   views must update **without** full page reload or asking the user to refresh.
   Use **`revalidatePath`** (in the Server Action body) or targeted
   **`router.refresh()`** only when a Server Action is inappropriate (browser
   auth SDK, OAuth, WebSocket). Do not use `router.refresh()` as default for
   every action.

2. **Prefer optimistic behavior** — For high-frequency row-level mutations
   (reorder, inline toggle), update the UI optimistically, then reconcile with
   the server response; **rollback** on error. Defer optimism only for
   irreversible or high-risk operations (document why).

3. **Minimize global loading** — Avoid full-page spinners/skeletons for quick
   mutations; use **button `pending`** (via `action.isPending` from
   `useActionForm`), row-level state, or subtle indicators. Reserve full-page
   loading for true initial data dependencies.

## Implementation hints

- Server-first forms: `revalidatePath()` in the Server Action body is the only
  mechanism needed. No `router.refresh()`.
- Client surfaces with TanStack Query: after a Server Action write, you may
  additionally call `queryClient.invalidateQueries()` from the form island's
  `onSuccess` to update in-memory cache before the next RSC render.
- Mutations **always** go through Server Actions. **Mutation hooks do not exist**
  in this codebase (`use-*-mutation.hook.codegen.ts` must not be created).
- Do not rely on **`window.location.reload()`** for normal flows.
