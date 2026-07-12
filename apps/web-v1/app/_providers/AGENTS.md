# `app/_providers` — web-v1 app

**Audience:** agents / LLM. Human overview: `apps/web-v1/README.md`.

## Role

Thin wrappers around `@workspace/core/providers/app` plus **app-only** providers
(wrap `WorkspaceAppProviders`).

## `app-providers.example.tsx`

- Exports `AppProviders` for `app/layout.tsx` and `app/[locale]/layout.tsx`.

Do not duplicate `QueryClient` / root `ThemeProvider` here — that lives in
`packages/core`.
