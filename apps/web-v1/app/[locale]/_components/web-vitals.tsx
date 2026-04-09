"use client"

import { useReportWebVitals } from "next/web-vitals"

/**
 * FORK: Replace the console.log with your analytics provider.
 * Examples: PostHog, Plausible, Vercel Analytics, custom endpoint.
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/analytics
 */
export function WebVitals(): null {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[Web Vitals]", metric)
    }
    // FORK: Send to analytics here.
    // Example: posthog.capture("web_vitals", { metric_name: metric.name, value: metric.value })
  })

  return null
}
