# Auth HTTP handlers — `(auth-handlers)`

**Audience:** agents / LLM.

## Role

Route group for **Supabase redirect targets**: `/callback`, `/auth/confirm`,
`/logout` (URLs are fixed in dashboard / `app-destination`).

Next.js **must** own `app/.../route.ts` files here; **logic** lives in
`@workspace/supabase-auth`:

- `@workspace/supabase-auth/server/route-handlers/auth-confirm-get`
- `@workspace/supabase-auth/server/route-handlers/callback-get`
- `@workspace/supabase-auth/server/route-handlers/logout-get`

Copy this folder’s shape into any new app that uses the same auth stack; only
wire `route.ts` → those exports.

`layout.tsx` sets `robots: noindex` for these routes.
