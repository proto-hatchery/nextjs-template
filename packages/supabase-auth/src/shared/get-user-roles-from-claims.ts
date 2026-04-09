import type { JwtPayload } from "@supabase/supabase-js"

import { normalizeAuthRole, type AuthRole } from "@workspace/supabase-auth/shared/auth-role"

type ClaimsLike = Pick<JwtPayload, "app_metadata" | "user_metadata"> | null | undefined

function toAuthRoles(value: unknown): AuthRole[] {
  if (typeof value === "string") {
    const normalized = normalizeAuthRole(value)
    return normalized ? [normalized] : []
  }

  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((role, index): role is AuthRole => {
      if (typeof role !== "string" || value.indexOf(role) !== index) {
        return false
      }

      return normalizeAuthRole(role) !== null
    })
    .map((role) => normalizeAuthRole(role))
    .filter((role): role is AuthRole => role !== null)
}

function getUserRolesFromClaims(claims: ClaimsLike): AuthRole[] {
  const roles = [
    ...toAuthRoles(claims?.app_metadata?.roles),
    ...toAuthRoles(claims?.app_metadata?.role),
    ...toAuthRoles(claims?.user_metadata?.roles),
    ...toAuthRoles(claims?.user_metadata?.role),
  ]

  return roles.filter((role, index) => roles.indexOf(role) === index)
}

export { getUserRolesFromClaims, type ClaimsLike }
