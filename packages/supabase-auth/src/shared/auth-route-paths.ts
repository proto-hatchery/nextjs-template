/**
 * Canonical path prefixes for auth flows (sign-in, OAuth callback, MFA, etc.).
 * Used for route classification and SEO/robots disallow rules — keep in sync with app routes.
 */
export const AUTH_ROUTE_PATH_PREFIXES = [
  "/access-denied",
  "/auth/confirm",
  "/callback",
  "/continue",
  "/forgot-password",
  "/sign-in",
  "/logout",
  "/magic-link",
  "/mfa",
  "/reset-password",
  "/sign-up",
] as const

export type AuthRoutePathPrefix = (typeof AUTH_ROUTE_PATH_PREFIXES)[number]

/**
 * Collapse auth entry points under `/auth/` for robots.txt so `/auth/*` is disallowed as one rule.
 */
export function authRoutePrefixToRobotsDisallowPath(prefix: string): string {
  if (prefix === "/auth/confirm" || prefix.startsWith("/auth/")) {
    return "/auth/"
  }
  return prefix
}

/**
 * Base disallow paths plus locale-prefixed variants (each base path is also emitted with `localeSegmentPattern` prepended).
 */
export function buildAuthRobotsDisallowPaths(options: { localeSegmentPattern: string }): string[] {
  const { localeSegmentPattern } = options
  const seen = new Set<string>()
  const base: string[] = []

  for (const p of AUTH_ROUTE_PATH_PREFIXES) {
    const normalized = authRoutePrefixToRobotsDisallowPath(p)
    if (!seen.has(normalized)) {
      seen.add(normalized)
      base.push(normalized)
    }
  }

  const localized = base.map((path) => `${localeSegmentPattern}${path}`)
  return [...base, ...localized]
}
