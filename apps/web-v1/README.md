# Web app (`apps/web-v1`)

A Next.js app for Fluri's public marketing surface and auth flows (`(auth)`
pages plus auth handlers for callback, confirmation, and logout).

| Path                                                                                                                | Content                                                                               |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `/`                                                                                                                 | Public landing / marketing                                                            |
| `/sign-in`, `/continue`, `/forgot-password`, `/reset-password`, `/magic-link`, `/mfa`, `/access-denied`, `/sign-up` | Auth pages (route group `(auth)`)                                                     |
| `/callback`, `/auth/confirm`, `/logout`                                                                             | Auth HTTP handlers (route group `(auth-handlers)`); URLs fixed for Supabase redirects |

Set `NEXT_PUBLIC_AUTH_APP_URL` per root [`.env.example`](../../.env.example) and
[docs/guides/supabase-setup.md](../../docs/guides/supabase-setup.md). Post-login
destinations: `packages/supabase-auth/src/shared/app-destination.ts`.

```bash
pnpm --filter web-v1 dev
```

## Directory convention (no `src/`)

This app keeps **Next.js entry points at the package root** (`app/`, `proxy.ts`,
`next.config.mjs`) and does **not** use a `src/` directory. Shared app code
lives next to `app/`:

| Path              | Role                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `i18n/`           | next-intl: `routing.ts`, `request.ts`, `navigation.ts` (plugin path: `./i18n/request.ts` in `next.config.mjs`). |
| `components/`     | Cross-route UI (e.g. `components/marketing/`, `locale-switcher.tsx`).                                           |
| `lib/`            | App-only helpers (e.g. `site-url.ts`).                                                                          |
| `app/_providers/` | App shell providers; e.g. `app-providers.example.tsx` (wrapper around `@workspace/core`).                       |
| `app/_hooks/`     | App-only hooks (see `app/_hooks/AGENTS.md`).                                                                    |

Keep this shape so docs and env comments stay accurate across Fluri surfaces.

## Layouts and components

| Location               | Content                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`       | Global shell: `AppProviders` from `app/_providers/app-providers.example.tsx`.                                                   |
| `app/(marketing)/`     | Public pages.                                                                                                                   |
| `app/(auth)/`          | Auth UI pages (forms, MFA, password flows).                                                                                     |
| `app/(auth-handlers)/` | Thin `route.ts` for `/callback`, `/auth/confirm`, `/logout` — handlers from `@workspace/supabase-auth/server/route-handlers/*`. |

Route-only components live under `app/.../feature/_components/` when they belong
to a single route.

## Tests

Centralized unit tests mirror this app’s paths under
[`tests/unit/web-v1/`](../../tests/unit/web-v1/) (e.g.
`app/(auth-handlers)/callback/route.test.ts` next to the real `route.ts` in
spirit). Vitest `include` is set in [`vitest.config.ts`](./vitest.config.ts).
See root [`tests/README.md`](../../tests/README.md).
