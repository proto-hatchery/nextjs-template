# `apps/space-v1/messages`

**Audience:** agents / LLM.

JSON dictionaries per locale (`pt-BR.json`, `en.json`, …), keyed by namespace
(`Metadata`, `AppShell`, `Auth`, …). Loaded from `i18n/request.ts` based on
`[locale]`.

## Rules

1. Add keys to **every** shipped locale file to avoid missing translations.
2. Use **nested objects** for grouping (`AppShell.routes.dashboard.title`).
   Auth-related copy remains only while upstream ownership is being removed;
   form validation uses `Auth.validation.*` (Zod) and `Auth.errors.*`
   (unexpected + `supabaseErrors` map for Supabase English strings).
3. **Server Components:** `getTranslations('Namespace')` from
   `next-intl/server`.
4. **Client Components:** `useTranslations('Namespace')` from `next-intl`.

## Types

`apps/space-v1/global.d.ts` augments `next-intl` with `Messages: typeof ptBR` —
keep JSON shapes aligned across locales after schema changes.

## Fork

Multiple deployable apps: consider `packages/i18n` with shared messages +
`defineRouting`.
