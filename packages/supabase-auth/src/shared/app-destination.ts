import type { JwtPayload } from "@supabase/supabase-js"

import {
  buildAuthAccessDeniedUrl,
  buildAuthSignInUrl,
  getAuthAppOrigin,
  getDefaultRedirectTo,
  getSafeRedirectTo,
} from "@workspace/supabase-auth/shared/auth-redirect"
import type { AuthRole } from "@workspace/supabase-auth/shared/auth-role"
import { getUserRolesFromClaims } from "@workspace/supabase-auth/shared/get-user-roles-from-claims"
import { getSupabasePublicEnv } from "@workspace/supabase-infra/env/public"

import { AUTH_ROUTE_PATH_PREFIXES } from "./auth-route-paths"

/**
 * URL segments for app surfaces reached after auth.
 * `web` stays on the canonical auth app origin; `space` can live on a separate app origin.
 * @see apps/example
 */
const APP_SEGMENT_PATHS = {
  web: "/dashboard",
  space: "/dashboard",
} as const

type AppSegmentKey = keyof typeof APP_SEGMENT_PATHS

/**
 * Where each role lands after sign-in.
 */
const ROLE_APP_MAP: Record<AuthRole, AppSegmentKey> = {
  admin: "web",
  patient: "web",
  psychologist: "space",
}

const AUTH_LOGIN_PATH = "/sign-in" as const

type AppSurfaceKey = AppSegmentKey | "auth"
type AppDestination = {
  app: AppSurfaceKey
  href: string
  label: string
  role: AuthRole | null
}
type ContinueDecision =
  | { kind: "redirect"; href: string }
  | { kind: "chooser"; destinations: AppDestination[] }
  | { kind: "access-denied"; href: string }

const _APP_SEGMENT_KEYS = Object.keys(APP_SEGMENT_PATHS) as AppSegmentKey[]

/** Primary app origin: aligns with `NEXT_PUBLIC_AUTH_APP_URL` (single-app template). */
function getPrimaryAppOrigin(): string {
  const auth = process.env.NEXT_PUBLIC_AUTH_APP_URL?.trim()
  if (auth) {
    return new URL(auth).origin
  }
  return "http://localhost:3000"
}

function getSpaceAppOrigin(): string {
  const env = getSupabasePublicEnv()
  const configured = env.NEXT_PUBLIC_SPACE_APP_URL?.trim()

  if (configured) {
    return new URL(configured).origin
  }

  return getPrimaryAppOrigin()
}

function getConfiguredAppUrl(app: AppSurfaceKey): string {
  if (app === "auth") {
    return new URL(AUTH_LOGIN_PATH, getPrimaryAppOrigin()).toString()
  }

  const path = APP_SEGMENT_PATHS[app]
  const origin = app === "space" ? getSpaceAppOrigin() : getPrimaryAppOrigin()
  return new URL(path, origin).toString()
}

function getAllowedSurfacesForRoles(roles: readonly AuthRole[]): AppSegmentKey[] {
  const surfaces = roles.map((role) => ROLE_APP_MAP[role]).filter(Boolean)

  return surfaces.filter(
    (surface, index, allSurfaces) =>
      allSurfaces.findIndex((candidate) => candidate === surface) === index
  )
}

function getSurfaceLabel(surface: AppSegmentKey): string {
  if (surface === "space") {
    return "Professional workspace"
  }

  return "Patient area"
}

/**
 * True when the URL is the shared auth landing (`/sign-in`) — no concrete workspace yet.
 * In that case we route by role to the default app surface instead of looping on `/sign-in`.
 */
function isAuthAppLandingOrSignIn(value: string): boolean {
  try {
    const u = new URL(value)
    const authOrigin = getPrimaryAppOrigin()
    if (u.origin !== authOrigin) {
      return false
    }
    return u.pathname === AUTH_LOGIN_PATH
  } catch {
    return false
  }
}

function isAuthRoutePath(pathname: string): boolean {
  return AUTH_ROUTE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

function getAppKeyForUrl(value: string): AppSurfaceKey | null {
  const redirectUrl = new URL(value)
  const primaryOrigin = getPrimaryAppOrigin()
  const spaceOrigin = getSpaceAppOrigin()

  if (redirectUrl.origin === primaryOrigin) {
    if (isAuthRoutePath(redirectUrl.pathname)) {
      return "auth"
    }

    return "web"
  }

  if (redirectUrl.origin === spaceOrigin) {
    return "space"
  }

  return null
}

function getDefaultAppForRoles(roles: readonly AuthRole[]) {
  const [surface] = getAllowedSurfacesForRoles(roles)

  if (surface) {
    return getConfiguredAppUrl(surface)
  }

  return null
}

function getDestinationsForRoles(roles: readonly AuthRole[]): AppDestination[] {
  return getAllowedSurfacesForRoles(roles).map((surface) => ({
    app: surface,
    href: getConfiguredAppUrl(surface),
    label: getSurfaceLabel(surface),
    role: roles.find((role) => ROLE_APP_MAP[role] === surface) ?? null,
  }))
}

function buildAuthContinueUrl(redirectTo?: string | null) {
  const url = new URL("/continue", getAuthAppOrigin())

  url.searchParams.set("redirect_to", getSafeRedirectTo(redirectTo))

  return url.toString()
}

function resolveAuthorizedRedirect({
  claims,
  redirectTo,
}: {
  claims: JwtPayload
  redirectTo?: string | null
}) {
  const requestedRedirectTo = getSafeRedirectTo(redirectTo)
  const requestedApp = getAppKeyForUrl(requestedRedirectTo)
  const roles = getUserRolesFromClaims(claims)
  const allowedSurfaces = getAllowedSurfacesForRoles(roles)

  if (requestedApp === "web" || requestedApp === "space") {
    if (allowedSurfaces.includes(requestedApp)) {
      return requestedRedirectTo
    }

    return (
      getDefaultAppForRoles(roles) ??
      buildAuthAccessDeniedUrl(requestedRedirectTo, [requestedApp]) ??
      buildAuthSignInUrl(requestedRedirectTo)
    )
  }

  if (requestedRedirectTo === getDefaultRedirectTo()) {
    return getDefaultAppForRoles(roles) ?? getConfiguredAppUrl("web")
  }

  if (requestedApp === "auth" && isAuthAppLandingOrSignIn(requestedRedirectTo)) {
    return getDefaultAppForRoles(roles) ?? getConfiguredAppUrl("web")
  }

  if (!requestedApp) {
    return requestedRedirectTo
  }

  if (requestedApp === "auth") {
    return requestedRedirectTo
  }

  return requestedRedirectTo
}

function getContinueDecision({
  redirectTo,
  roles,
}: {
  redirectTo?: string | null
  roles: readonly AuthRole[]
}): ContinueDecision {
  const requestedRedirectTo = getSafeRedirectTo(redirectTo)
  const requestedApp = getAppKeyForUrl(requestedRedirectTo)
  const allowedSurfaces = getAllowedSurfacesForRoles(roles)

  if (requestedApp === "web" || requestedApp === "space") {
    if (allowedSurfaces.includes(requestedApp)) {
      return { kind: "redirect", href: requestedRedirectTo }
    }

    if (allowedSurfaces.length === 1) {
      const [surface] = allowedSurfaces

      if (surface) {
        return {
          kind: "redirect",
          href: getConfiguredAppUrl(surface),
        }
      }
    }

    if (allowedSurfaces.length > 1) {
      return { kind: "chooser", destinations: getDestinationsForRoles(roles) }
    }

    return {
      kind: "access-denied",
      href: buildAuthAccessDeniedUrl(requestedRedirectTo, [requestedApp]),
    }
  }

  if (requestedApp === "auth" && isAuthAppLandingOrSignIn(requestedRedirectTo)) {
    if (allowedSurfaces.length === 1) {
      const [surface] = allowedSurfaces

      if (!surface) {
        return {
          kind: "redirect",
          href: getConfiguredAppUrl("web"),
        }
      }

      return {
        kind: "redirect",
        href: getConfiguredAppUrl(surface),
      }
    }
    if (allowedSurfaces.length > 1) {
      return { kind: "chooser", destinations: getDestinationsForRoles(roles) }
    }
    return {
      kind: "redirect",
      href: getConfiguredAppUrl("web"),
    }
  }

  if (!requestedApp) {
    return { kind: "redirect", href: requestedRedirectTo }
  }

  if (requestedApp === "auth") {
    return { kind: "redirect", href: requestedRedirectTo }
  }

  return {
    kind: "access-denied",
    href: buildAuthAccessDeniedUrl(requestedRedirectTo, []),
  }
}

export {
  buildAuthContinueUrl,
  getContinueDecision,
  getConfiguredAppUrl,
  getDestinationsForRoles,
  resolveAuthorizedRedirect,
  type AppDestination,
  type ContinueDecision,
  type AppSurfaceKey,
}
