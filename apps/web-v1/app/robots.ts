import type { MetadataRoute } from "next"

import { getSiteUrl, isRobotsAllowIndexing } from "@/lib/site-url"
import { buildAuthRobotsDisallowPaths } from "@workspace/supabase-auth/shared/auth-route-paths"

const authAdminDisallow = buildAuthRobotsDisallowPaths({
  localeSegmentPattern: "/*",
})

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()
  const origin = new URL(`${base}/`)

  if (!isRobotsAllowIndexing()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: authAdminDisallow,
    },
    sitemap: new URL("/sitemap.xml", origin).toString(),
    host: origin.host,
  }
}
