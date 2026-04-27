import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()
  const origin = new URL(`${base}/`)

  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    host: origin.host,
  }
}
