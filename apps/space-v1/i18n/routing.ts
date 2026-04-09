import { defineRouting } from "next-intl/routing"

// FORK (B2B): Most B2B SaaS products ship with 1 locale (en) or 2 (en + one regional language).
// Keep locales array minimal. Use localePrefix: 'as-needed' for clean URLs.
//
// FORK (B2C): Add all target market locales. Use localePrefix: 'always' for SEO clarity.
// Consider domain-based routing (e.g. example.de, example.fr) for large multi-market deployments.
// Ensure content parity: do not add a locale until ≥80% of strings are translated.
//
// FORK: Multi-app monorepos may extract shared `defineRouting` + messages to `packages/i18n` later.

export const routing = defineRouting({
  // FORK: Add or remove locales for your product.
  locales: ["pt-BR", "en"],

  // FORK: Change to your product's primary locale.
  defaultLocale: "pt-BR",

  // 'as-needed' = default locale has no prefix (/). 'always' = every locale prefixed (/pt-BR/, /en/).
  localePrefix: "as-needed",
})

export type Locale = (typeof routing.locales)[number]

export const defaultLocale = routing.defaultLocale
