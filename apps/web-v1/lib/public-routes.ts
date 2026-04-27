/**
 * FORK: Add every public, indexable route here.
 * These routes are included in sitemap.ts.
 * Auth routes are excluded automatically via robots.ts.
 *
 * Format: leading slash, no trailing slash, no locale prefix.
 * Examples: "/", "/about", "/pricing", "/blog"
 */
export const PUBLIC_ROUTES = [
  "/",
  // FORK: Add your public routes here.
  // "/about",
  // "/pricing",
] as const

export type PublicRoute = (typeof PUBLIC_ROUTES)[number]
