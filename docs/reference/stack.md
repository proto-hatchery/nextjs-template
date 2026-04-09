# Technology stack (canonical)

This document is the **contract for this template**: what is intentionally
pinned and where it lives. When you fork the repo, treat versions here as the
source of truth unless you are upgrading the whole stack.

**Operational rules** (imports, migrations, tests) stay in
[repository-standards.md](../standards/repository-standards.md) and
[AGENTS.md](../AGENTS.md).

---

## At-a-glance (verify in `package.json` when bumping)

| Area                  | Pinned in repo            | Typical location                                   |
| --------------------- | ------------------------- | -------------------------------------------------- |
| **Node**              | `>=20`                    | Root `package.json` → `engines`                    |
| **pnpm**              | `10.x` (`packageManager`) | Root                                               |
| **TypeScript**        | `5.9.x`                   | Root + packages + apps                             |
| **Next.js**           | `16.2.x`                  | `apps/*`, `@workspace/supabase-auth`               |
| **React / React DOM** | `^19.2.x`                 | Apps + UI + packages that render                   |
| **Tailwind**          | `^4.2.x`                  | `@tailwindcss/postcss`, `tailwindcss` in UI + apps |
| **Zod**               | `^4.3.x`                  | Example app, data layer, forms, logging, UI        |
| **Supabase JS**       | `^2.101.x`                | `@supabase/supabase-js`                            |
| **Supabase SSR**      | `^0.10.x`                 | `@supabase/ssr`                                    |
| **Supabase CLI**      | `^2.84.x`                 | Root `devDependencies`                             |
| **Turborepo**         | `^2.9.x`                  | Root                                               |
| **Vitest**            | `^4.1.x`                  | Root + packages + apps                             |
| **Lint / format**     | **Oxlint** + **Oxfmt**    | Root `.oxlintrc.json`, `.oxfmtrc.json`             |

---

## Runtime and language

| Layer                     | Choice                      | Notes                                                                                       |
| ------------------------- | --------------------------- | ------------------------------------------------------------------------------------------- |
| **Node.js**               | `>=20`                      | Root `package.json` → `engines`.                                                            |
| **pnpm**                  | **10.x**                    | `packageManager` field; workspaces in `pnpm-workspace.yaml`.                                |
| **TypeScript**            | **5.9.x**                   | Shared bases: `packages/typescript-config` (`base.json`, `nextjs.json`, …).                 |
| **Orchestration**         | **Turborepo**               | `turbo.json`; tasks `build`, `lint`, `dev`, `test`, DB suites.                              |
| **Env loading (scripts)** | **dotenv** + **dotenv-cli** | Root scripts use `dotenv -e .env` / `.env.local` / `.env.test` so Turbo sees the same vars. |

---

## Apps: Next.js and React

| Layer                 | Choice                                                                         | Notes                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Framework**         | **Next.js 16** (App Router)                                                    | `next` + `@next/env` in apps; the template `example` app uses **Turbopack** in dev (`next dev --turbopack`) — see `apps/example/package.json` → `dev`. |
| **React**             | **19.x**                                                                       | Server Components by default.                                                                                                                          |
| **Build**             | `next build --turbopack`                                                       | As configured in apps (align with dev bundler choices when changing).                                                                                  |
| **Session**           | Root **`proxy.ts`** (not `middleware.ts`)                                      | Cookie/session refresh — [repository-standards.md](../standards/repository-standards.md).                                                              |
| **SEO (example app)** | `metadataBase`, `robots.ts`, `sitemap.ts`, `manifest.ts`, route-group `robots` | Env: `NEXT_PUBLIC_SITE_URL`, `ROBOTS_ALLOW`, `NEXT_PUBLIC_DEFAULT_LOCALE` — [seo.md](../guides/seo.md).                                                |

---

## Styling: Tailwind CSS v4 + shadcn + Radix

| Layer                 | Choice                                                        | Notes                                                                                  |
| --------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **CSS**               | **Tailwind CSS v4**                                           | `tailwindcss`, `@tailwindcss/postcss`; shared globals via `@workspace/ui/globals.css`. |
| **Class merging**     | **tailwind-merge**, **clsx**                                  | Typical shadcn stack.                                                                  |
| **Variants**          | **class-variance-authority (CVA)**                            | Component variants in UI layer.                                                        |
| **Primitives**        | **shadcn** (`shadcn` CLI package) + **Radix UI** (`radix-ui`) | Components live only in **`packages/ui`** (CLI add — do not hand-edit for product).    |
| **Animation**         | **tw-animate-css**                                            | With Tailwind v4 setup.                                                                |
| **Theming**           | **next-themes**                                               | Dark/light across apps / brand.                                                        |
| **Toasts**            | **sonner**                                                    | Often used with shadcn toast patterns.                                                 |
| **Icons**             | **lucide-react**                                              | Shared across apps and `packages/ui`.                                                  |
| **Shared product UI** | **`@workspace/brand`**                                        | Hand-written multi-app components on top of `@workspace/ui`.                           |

```bash
pnpm dlx shadcn@latest add <component> -c packages/ui
```

---

## Validation: Zod v4

| Layer              | Choice              | Notes                                                                                                |
| ------------------ | ------------------- | ---------------------------------------------------------------------------------------------------- |
| **Schema library** | **Zod v4**          | `apps/example`, `@workspace/supabase-data`, `@workspace/forms`, `@workspace/logging`, `packages/ui`. |
| **Rule**           | Parse at boundaries | [GR-006](../standards/golden-rules.md#gr-006-parse-at-boundaries).                                   |

Bump Zod **across all packages that list it** in one maintenance pass.

---

## Data and auth: Supabase

| Layer                | Choice                                                                                | Notes                                                                                                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Platform**         | **Supabase** (Postgres, Auth, Storage, Edge-ready clients)                            | Local via **Supabase CLI**; new migration files only via **`pnpm supabase:migration:new`** + **`pnpm supabase db diff -o …`** ([GR-015](../standards/golden-rules.md#gr-015-cli-generated-migrations-only-critical---human-confirmation-required)). |
| **Clients**          | `@supabase/supabase-js`                                                               | Browser and server data plane.                                                                                                                                                                                                                      |
| **Next integration** | `@supabase/ssr`                                                                       | Cookie/session patterns with Next.js.                                                                                                                                                                                                               |
| **Workspace**        | `@workspace/supabase-infra` · `@workspace/supabase-auth` · `@workspace/supabase-data` | Infra/types vs session vs repositories/actions — [ARCHITECTURE.md](../architecture/system.md).                                                                                                                                                      |

Setup: [docs/guides/supabase-setup.md](../guides/supabase-setup.md). Types:
`pnpm supabase:types:local` / `supabase:types:linked`.

---

## TanStack, React Hook Form, and resolvers

| Library                 | Role                        | Where                                                       |
| ----------------------- | --------------------------- | ----------------------------------------------------------- |
| **TanStack Query**      | Async server-state, caching | Add to your app when needed (not required by the template). |
| **TanStack Table**      | Headless tables             | `apps/example`, `packages/ui`.                              |
| **React Hook Form**    | Form state + Zod            | `@workspace/forms` (`react-hook-form`).                     |
| **React Hook Form**     | Controlled forms + shadcn   | `apps/example`, `packages/ui` (primitives/hooks).           |
| **@hookform/resolvers** | **RHF + Zod** bridge        | `apps/example` (e.g. `zodResolver` patterns).               |

Prefer **`@workspace/forms`** for shared field helpers aligned with Zod v4.

---

## Observability

| Layer                                | Choice                   | Notes                                                                                                                                                                                |
| ------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Structured logging / correlation** | **`@workspace/logging`** | Contracts, redaction, server/client/edge entrypoints — [docs/guides/observability-architecture.md](../guides/observability-architecture.md), [GR-018](../standards/golden-rules.md). |

---

## Example app / feature libraries

Not all are required for a minimal fork.

| Library                 | Role                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| **Recharts**            | Charts in admin/dashboard surfaces (`apps/example`, `packages/ui` dep for shared charts). |
| **@react-pdf/renderer** | PDF generation (`apps/example`).                                                          |
| **bwip-js**             | Barcode generation where used (`apps/example`).                                           |
| **sharp**               | Image processing (`apps/example`).                                                        |

---

## Testing and quality

| Tool                 | Role                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Vitest** `3.x`     | Unit/integration; **v8** coverage via `@vitest/coverage-v8`; configs in `@workspace/vitest-config`.     |
| **Testing Library**  | `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` (root / packages). |
| **jsdom**            | DOM environment for component tests.                                                                    |
| **Oxlint** `0.158.x` | `@workspace/oxlint-config`: `node`, `react`, `next`; Fast, parallel linting.                            |
| **Prettier** `3.x`   | **`prettier-plugin-tailwindcss`** for class order.                                                      |
| **Custom guard**     | `pnpm check:forbidden`                                                                                  | `scripts/ci/check-forbidden.mjs` (e.g. server `getSession`, `packages/ui` Git changes unless `ALLOW_PACKAGES_UI_CHANGES=1`). |

Details: [TESTING.md](../architecture/testing.md).

---

## Misc dev tooling (root)

| Tool                    | Role                            |
| ----------------------- | ------------------------------- |
| **vite-tsconfig-paths** | Vitest/TS path resolution.      |
| **@turbo/gen**          | Codegen (`packages/ui` devDep). |

---

## Version bumps (maintainers)

1. Bump **Next** and **@next/env** together.
2. Bump **React** / **React DOM** together.
3. Bump **Zod** across all packages, then `pnpm install`, `pnpm typecheck`,
   tests.
4. Bump **Tailwind** in UI and apps.
5. After **Supabase CLI** or DB changes, `pnpm supabase:types:local`.
6. Update **oxlint** and **oxfmt** together.
7. Keep **Turborepo** updated for caching improvements.

---

## See also

- [ARCHITECTURE.md](../architecture/system.md) — layers and package boundaries
- [BACKEND.md](../architecture/backend.md) — data layer
- [DATABASE.md](../architecture/database.md) — RLS and migrations
- [TESTING.md](../architecture/testing.md) — suites and commands
- [docs/guides/observability-architecture.md](../guides/observability-architecture.md)
  — logging contracts
- [docs/guides/client-ui-data-sync.md](../guides/client-ui-data-sync.md) —
  mutations and cache
- [docs/reference/command-reference.md](./command-reference.md) — npm/pnpm
  scripts
- [docs/standards/golden-rules.md](../standards/golden-rules.md) — GR-006,
  GR-015, GR-017, GR-018, GR-019

**Last updated:** 2026-03-28
