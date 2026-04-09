# `apps/example` — template Next.js app

**Audience:** agents / LLM. Human-oriented file list: `README.md` in this
folder.

## Stack entry

- Dev: `pnpm --filter example dev`
- Env: root `.env.example`, `docs/guides/supabase-setup.md`
- Post-login URLs: `packages/supabase-auth/src/shared/app-destination.ts`

## Layout

- **No `src/`** — `app/`, `proxy.ts`, `next.config.mjs` at package root.
- **`app/_providers/`** — see `app/_providers/AGENTS.md`
  (`app-providers.example.tsx` → `@workspace/core`).
- **`app/_hooks/`** — see `app/_hooks/AGENTS.md` (app-only hooks; `*.example.*`
  naming).
- **`i18n/`** — `routing.ts`, `request.ts`, `navigation.ts`
- **`messages/`** — see `messages/AGENTS.md`
- **`app/[locale]/`** — marketing + auth routes; `(auth-handlers)/` for
  `/callback`, `/auth/confirm`, `/logout`. Auth search-param parsing:
  `resolveAuthSearchParams` from
  `@workspace/supabase-auth/shared/resolve-auth-search-params`. Form validation:
  `createAuthFormSchemas` from
  `@workspace/supabase-auth/shared/auth-form-schemas` + `useAuthFormSchemas` in
  `app/[locale]/(auth)/_lib/auth-form-schemas.ts` (next-intl messages under
  `Auth.validation`).
- **`tests/e2e/`** — see `tests/e2e/AGENTS.md` (minimal Playwright)
- **`docs/`** — see `docs/AGENTS.md` (app-level docs)

## Monorepo contracts

Root **`AGENTS.md`**, **`docs/architecture/core-package.md`**, Golden Rules
`docs/standards/golden-rules.md`.
