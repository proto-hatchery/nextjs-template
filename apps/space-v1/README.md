# Space app (`apps/space-v1`)

A Next.js app for the protected professional workspace surface. Public auth
entry, callback handling, logout, password reset, MFA entry, and post-login
orchestration are owned by `apps/web-v1`, and `space-v1` now acts only as the
post-auth workspace destination.

| Path         | Content                                                                           |
| ------------ | --------------------------------------------------------------------------------- |
| `/`          | Redirects to the protected workspace entry (`/dashboard`)                         |
| `/dashboard` | Protected workspace landing for psychologist/admin users inside the shell         |
| `auth URLs`  | Transitional compatibility only: `proxy.ts` redirects auth paths to `apps/web-v1` |

Set both `NEXT_PUBLIC_AUTH_APP_URL` and `NEXT_PUBLIC_SPACE_APP_URL` per root
[`.env.example`](../../.env.example) and
[docs/guides/supabase-setup.md](../../docs/guides/supabase-setup.md). Shared
post-login routing lives in
`packages/supabase-auth/src/shared/app-destination.ts`.

```bash
pnpm --filter space-v1 dev
```

## Directory convention (no `src/`)

This app keeps **Next.js entry points at the package root** (`app/`, `proxy.ts`,
`next.config.mjs`) and does **not** use a `src/` directory. Shared app code
lives next to `app/`:

| Path              | Role                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `i18n/`           | next-intl: `routing.ts`, `request.ts`, `navigation.ts` (plugin path: `./i18n/request.ts` in `next.config.mjs`). |
| `components/`     | Minimal app-level shared UI (currently `locale-switcher.tsx` only).                                             |
| `lib/`            | App-only helpers (e.g. `site-url.ts`).                                                                          |
| `app/_providers/` | App shell providers; e.g. `app-providers.example.tsx` (wrapper around `@workspace/core`).                       |
| `app/_hooks/`     | App-only hooks; prefer `*.example.ts` / `*.example.tsx` for template/fork clarity (see `app/_hooks/AGENTS.md`). |

Forks should keep the same shape so docs and env comments stay accurate.

## Layouts and components

| Location                    | Content                                                                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`            | Global shell: `AppProviders` from `app/_providers/app-providers.example.tsx`.                                              |
| `app/[locale]/page.tsx`     | Redirect-only entry that sends the locale root to `/dashboard`.                                                            |
| `app/[locale]/(workspace)/` | Persistent protected workspace shell with internal route groups for overview, care, operations, presence, and preferences. |
| `app/[locale]/(flows)/`     | Protected task-scoped flows without the persistent workspace chrome, currently reserved for onboarding.                    |
| `proxy.ts`                  | Redirects auth compatibility paths to `apps/web-v1` so `space-v1` remains protected-only.                                  |

Route-only components live under `app/.../feature/_components/` when they belong
to a single route.

## Tests

Centralized unit tests mirror this app’s paths under
[`tests/unit/example/`](../../tests/unit/example/). Vitest `include` is set in
[`vitest.config.ts`](./vitest.config.ts). See root
[`tests/README.md`](../../tests/README.md).
