# SEO notes (`apps/example`)

How this app inherits **template SEO defaults** and where to override them when
you fork.

---

## Inheriting template defaults

| File                                                               | Role                                                                                                                                                                                               |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`                                                   | Pass-through root layout only (no `<html>` / metadata).                                                                                                                                            |
| `app/[locale]/layout.tsx`                                          | `metadataBase`, default title template, Open Graph, Twitter, `alternates` (canonical + hreflang), `<html lang={locale}>`, fonts, providers + `NextIntlClientProvider`                              |
| `lib/site-url.ts`                                                  | `getSiteUrl()` (re-exports `getPublicSiteUrl` from `@workspace/supabase-infra/env/site`), `getDefaultLocale()` (from `routing.defaultLocale`), `isRobotsAllowIndexing()`                           |
| `app/robots.ts`                                                    | Crawl rules gated by `ROBOTS_ALLOW`; auth `disallow` paths from `buildAuthRobotsDisallowPaths` in `@workspace/supabase-auth/shared/auth-route-paths` (canonical prefixes + locale segment pattern) |
| `app/sitemap.ts`                                                   | Public URLs from `lib/public-routes.ts` (`PUBLIC_ROUTES`) per locale; empty when `ROBOTS_ALLOW` is not `true`                                                                                      |
| `lib/public-routes.ts`                                             | Typed list of indexable pathnames for the sitemap — register every new public page here.                                                                                                           |
| `@workspace/seo`                                                   | `buildCanonicalUrl`, `buildAlternateLanguages`, `buildJsonLd` — pass `siteUrl` and locale args from the app (no import of `i18n/routing` inside the package).                                      |
| `app/manifest.ts`                                                  | PWA manifest stub                                                                                                                                                                                  |
| `app/[locale]/(auth)/layout.tsx`, `app/(auth-handlers)/layout.tsx` | `noindex,nofollow` for auth UI and auth HTTP handlers                                                                                                                                              |
| `i18n/routing.ts`                                                  | Locales and `localePrefix` — source of truth with `messages/*.json`                                                                                                                                |

Canonical repo guide:
[../../../docs/guides/seo.md](../../../docs/guides/seo.md).  
i18n details:
[../../../docs/guides/i18n-lang.md](../../../docs/guides/i18n-lang.md).

---

## Page-level metadata

**Static page** under `app/[locale]/(marketing)/`:

```tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description: "…",
}
```

**Dynamic metadata:** use `generateMetadata` — see `app/[locale]/layout.tsx` and
`app/[locale]/(marketing)/page.tsx` for locale-aware `params`. **Set
`alternates.canonical` to the absolute URL for that page** (do not rely on
layout alone for deep routes).

**OG image files:** `(marketing)/opengraph-image.tsx` supplies dynamic OG for
the marketing segment; `public/og-default.png` is the tracked 1200×630 fallback.
See [../../../docs/guides/seo.md](../../../docs/guides/seo.md).

---

## JSON-LD on content pages

Add an inline script in the **same** Server Component that owns the content:

```tsx
const jsonLd = { "@context": "https://schema.org", "@type": "Article" /* … */ }
// …
;<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

Prefer `buildJsonLd` from `@workspace/seo` for serialization. Do not re-export
schema builders from a barrel file; import helpers directly if you extract them
(zero-barrel policy). See
[../../../docs/guides/structured-data.md](../../../docs/guides/structured-data.md).

---

## What to change at fork time

- Replace placeholder strings in **`messages/en.json`** (and other locales) and
  **`app/manifest.ts`**.
- Set production **`NEXT_PUBLIC_SITE_URL`** (https) and **`ROBOTS_ALLOW=true`**
  only on the indexed deployment.
- Keep **`NEXT_PUBLIC_DEFAULT_LOCALE`** aligned with `i18n/routing.ts`
  `defaultLocale`.
- Swap **`/og-default.png`** for a branded 1200×630 asset.
- Add public routes to **`lib/public-routes.ts`** (`PUBLIC_ROUTES`);
  `sitemap.ts` reads from there — never list auth or admin URLs.
- Adjust **Organization** JSON-LD on the marketing home page (logo, `sameAs`,
  etc.).

Checklist:
[../../../docs/checklists/seo-fork.md](../../../docs/checklists/seo-fork.md).
