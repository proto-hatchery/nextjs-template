/**
 * Get JWT claims from authenticated user
 *
 * This is the **PRIMARY method for server authentication**.
 * Uses JWKS cache - typically 0 network calls after first request.
 *
 * ## Performance
 *
 * | Call | Network Calls | Latency |
 * |------|--------------|---------|
 * | First | 1 (JWKS fetch) | ~50ms |
 * | Subsequent | 0 (cache hit) | <1ms |
 *
 * ## Why getClaims() over getUser()?
 *
 * **Use getClaims() when:**
 * - ✅ Simple auth checks (is user logged in?)
 * - ✅ Getting user ID
 * - ✅ Checking user role
 * - ✅ Performance-critical paths
 *
 * **Use getUser() when:**
 * - ✅ Need full user profile
 * - ✅ Need email confirmation status
 * - ✅ Need last_sign_in_at
 * - ✅ Need metadata from DB
 *
 * ## Usage
 *
 * ```typescript
 * import { getClaims } from "@workspace/supabase-auth/session"
 *
 * export async function myServerAction() {
 *   const claims = await getClaims()
 *
 *   if (!claims?.sub) {
 *     throw new Error("Unauthorized")
 *   }
 *
 *   const userId = claims.sub
 *   const userRole = claims.user_role
 * }
 * ```
 *
 * ## JWT Claims Structure
 *
 * ```typescript
 * interface JWTClaims {
 *   sub: string              // User ID
 *   email?: string           // Email address
 *   user_role?: string       // App role (admin, user, etc.)
 *   app_metadata?: object    // Custom claims from hook
 *   user_metadata?: object   // User metadata
 *   aud?: string            // Audience
 *   exp?: number            // Expiry timestamp
 *   iat?: number            // Issued at timestamp
 *   iss?: string            // Issuer
 * }
 * ```
 *
 * @returns JWT claims object or null if not authenticated
 * @security Preferred over getUser() for simple auth checks
 * @performance Cached with React.cache() - deduplicated per request
 *
 * @module @workspace/supabase-auth/session/get-claims
 */
import "server-only"
import type { JwtPayload } from "@supabase/supabase-js"
import { unstable_rethrow } from "next/navigation"
import { cache } from "react"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"

/**
 * JWT claims interface
 *
 * Contains user identity and authorization data from Supabase JWT.
 * Extends JwtPayload with additional metadata fields.
 */
export interface JWTClaims extends Omit<JwtPayload, "sub" | "role" | "aal" | "session_id"> {
  sub: string
  role?: string
  aal?: string
  session_id?: string
  email?: string
  user_role?: string
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
  aud?: string
  exp?: number
  iat?: number
  iss?: string
  [key: string]: unknown
}

/**
 * Get and cache JWT claims
 *
 * Uses React cache() for request-level deduplication.
 * Multiple calls within same request return cached result.
 *
 * @returns Promise resolving to JWT claims or null
 */
export const getClaims = cache(async (): Promise<JWTClaims | null> => {
  const startedAt = Date.now()

  try {
    const supabase = await createServerAuthClient()
    const { data } = await supabase.auth.getClaims()

    if (!data?.claims) {
      return null
    }

    return data.claims as JWTClaims
  } catch (error) {
    unstable_rethrow(error)

    await logServerEvent({
      component: "auth.session",
      durationMs: Date.now() - startedAt,
      error,
      eventFamily: "auth.flow",
      eventName: "claims_lookup_failed",
      metadata: {
        failure_phase: "claims",
      },
      operation: "get_claims",
      operationType: "auth",
      outcome: "failure",
      persist: true,
      service: "auth",
    })

    // Auth errors return null - let caller handle unauthorized
    return null
  }
})
