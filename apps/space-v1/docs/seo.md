# SEO notes (`apps/space-v1`)

`space-v1` is a protected workspace destination, not a public marketing or auth
surface. Its metadata remains minimal, and search indexing is intentionally
disabled.

---

## Current behavior

| File                      | Role                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `app/[locale]/layout.tsx` | Declares default metadata for the protected workspace and sets `robots: noindex,nofollow`.                                     |
| `app/robots.ts`           | Disallows all crawling because this app is not meant to be indexed.                                                            |
| `app/sitemap.ts`          | Returns an empty sitemap because there are no public indexable routes in `space-v1`.                                           |
| `lib/public-routes.ts`    | Intentionally empty; this app does not expose public marketing routes.                                                         |
| `app/[locale]/page.tsx`   | Redirect-only route to `/dashboard`; it is not treated as an indexable landing page.                                           |
| `apps/web-v1`             | Canonical public/auth surface. Any public acquisition or auth-adjacent SEO concerns belong there, not in `space-v1`.           |
| `i18n/routing.ts`         | Locales and `localePrefix` remain the source of truth for route generation and localized redirects in the protected workspace. |

Canonical repo guide:
[../../../docs/guides/seo.md](../../../docs/guides/seo.md). i18n details:
[../../../docs/guides/i18n-lang.md](../../../docs/guides/i18n-lang.md).

---

## Guidance

If a future phase ever introduces a truly public route to `space-v1`, revisit:

- `app/[locale]/layout.tsx`
- `app/robots.ts`
- `app/sitemap.ts`
- `lib/public-routes.ts`

Until then, keep this app non-indexable and move public storytelling or
acquisition pages to `web-v1`.

---

## What not to do

- Do not reintroduce marketing pages into `space-v1`.
- Do not add protected workspace routes to `PUBLIC_ROUTES`.
- Do not enable indexing here just because `web-v1` is public.
