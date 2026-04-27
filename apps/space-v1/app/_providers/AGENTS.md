# `app/_providers` — example app

**Audience:** agents / LLM. Human overview: `apps/example/README.md`.

## Role

Thin wrappers around `@workspace/core/providers/app` plus **app-only** providers
(wrap `WorkspaceAppProviders`).

## `app-providers.example.tsx`

- Exports `AppProviders` for `app/layout.tsx` and `app/[locale]/layout.tsx`.
- **`.example`** = template app; rename on fork (e.g. `app-providers.tsx`).

Do not duplicate `QueryClient` / root `ThemeProvider` here — that lives in
`packages/core`.
