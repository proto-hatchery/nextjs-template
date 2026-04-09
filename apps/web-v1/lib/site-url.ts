import { routing } from "@/i18n/routing"
import { getPublicSiteUrl, isRobotsAllowIndexing } from "@workspace/supabase-infra/env/site"

/** Re-export for app imports; see `@workspace/supabase-infra/env/site`. */
export function getSiteUrl(): string {
  return getPublicSiteUrl()
}

/** Source of truth: `routing.defaultLocale` in `i18n/routing.ts`. Keep `NEXT_PUBLIC_DEFAULT_LOCALE` aligned when you fork. */
export function getDefaultLocale(): string {
  return routing.defaultLocale
}

export { isRobotsAllowIndexing }
