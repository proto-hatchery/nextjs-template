# `apps/space-v1` — protected workspace app

**Audience:** agents / LLM. Human-oriented file list: `README.md` in this
folder.

## Stack entry

- Dev: `pnpm --filter space-v1 dev`
- Env: root `.env.example`, `docs/guides/supabase-setup.md`
- Post-login URLs: `packages/supabase-auth/src/shared/app-destination.ts`

## Layout

- **No `src/`** — `app/`, `proxy.ts`, `next.config.mjs` at package root.
- **`app/_providers/`** — see `app/_providers/AGENTS.md`
  (`app-providers.example.tsx` → `@workspace/core`).
- **`app/_hooks/`** — see `app/_hooks/AGENTS.md` (app-only hooks).
- **`i18n/`** — `routing.ts`, `request.ts`, `navigation.ts`
- **`messages/`** — see `messages/AGENTS.md`
- **`app/[locale]/`** — protected workspace entry plus protected route groups:
  root redirects to `/dashboard`, `(workspace)` for persistent shell surfaces
  and `(flows)` for protected task-scoped journeys. Inside `(workspace)`, prefer
  route-local ownership via domain groups such as `(overview)`, `(care)`,
  `(operations)`, `(presence)`, and `(settings)`. Auth entry and auth handlers
  live in `apps/web-v1`; `proxy.ts` redirects legacy auth paths there.
- **`tests/e2e/`** — see `tests/e2e/AGENTS.md` (minimal Playwright)
- **`docs/`** — see `docs/AGENTS.md` (app-level docs)

## Monorepo contracts

Root **`AGENTS.md`**, **`docs/architecture/core-package.md`**, Golden Rules
`docs/standards/golden-rules.md`.
