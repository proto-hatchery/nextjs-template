# Architecture overview

High-level map of this template. For depth, use the
**[Architecture handbook](./README.md)** and **[System layers](./system.md)**.

## Layers (short)

| Layer                | Location                                                    | Role                                            |
| -------------------- | ----------------------------------------------------------- | ----------------------------------------------- |
| Apps                 | `apps/<name>/`                                              | Next.js surfaces, routes, app-only UI           |
| Composition packages | `packages/brand`, `core`, `forms`, `seo`                    | Shared UI/forms/SEO (filename suffixes apply)   |
| Data & auth          | `packages/supabase-data`, `supabase-auth`, `supabase-infra` | Actions, repositories, clients, auth            |
| Primitives           | `packages/ui`                                               | shadcn (CLI only; do not hand-edit for product) |
| Observability        | `packages/logging`                                          | Structured logging                              |

## Documentation map

- **[Backend](./backend.md)** — Data layer, actions, repositories
- **[Business logic placement](./business-logic-placement.md)** — Service layer,
  separation of responsibilities
- **[Database](./database.md)** — Migrations, RLS, policies
- **[Testing](./testing.md)** — Vitest, integration, RLS, pgTAP
- **[TDD](./tdd.md)** — Red / green / refactor

## Related

- [CRITICAL-RULES.md](./CRITICAL-RULES.md) — Non‑negotiable architecture rules
  for PRs
