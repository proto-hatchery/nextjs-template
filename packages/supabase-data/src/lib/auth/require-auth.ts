/**
 * requireAuth — Centralized auth check for Server Actions
 *
 * SSOT (Single Source of Truth) for authentication in generated actions.
 *
 * ## Usage
 *
 * ```typescript
 * "use server"
 * import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
 *
 * export async function someAction() {
 *   const { userId, claims } = await requireAuth({ action: "some_action" })
 *   // ... proceed with authenticated operation
 * }
 * ```
 *
 * ## Why This Exists
 *
 * With asymmetric JWT signing keys (2026 standard), `getClaims()` is a local
 * cryptographic operation costing ~0.1–1ms (no network round-trip). This makes
 * application-layer auth checks viable for:
 *
 * 1. **Early exit** — fail fast before any DB call
 * 2. **Structured logging** — audit trail for compliance (HIPAA, LGPD, SOC2)
 * 3. **Observability** — detect enumeration attacks, unauthorized attempts
 * 4. **SSOT** — all 285+ generated actions use this one helper
 *
 * ## Security Decision Log
 *
 * **Using getClaims() per Supabase official recommendation for asymmetric JWT**
 * projects (all projects created after May 1, 2025 use asymmetric keys by
 * default). SOURCE: https://github.com/orgs/supabase/discussions/29289
 *
 * **KNOWN TRADEOFF (ACCEPTED):**
 * getClaims() does not verify token revocation with the Auth server.
 * A banned user retains access until JWT expiry.
 *
 * **MITIGATION IN PLACE:**
 * JWT expiry is set to 900s (15 min) in Project Settings > JWT Keys.
 * This limits the breach window to 15 minutes maximum.
 *
 * **DO NOT switch to getUser() in middleware** — CVE-2025-29927 bypass risk.
 * **DO NOT switch to getUser() per-action** — causes 429 rate limit errors at
 * production scale. SOURCE: https://github.com/supabase/auth-js/issues/898
 *
 * **EXCEPTION:** If this app requires immediate revocation (HIPAA incident SLA
 * < 15 min), revisit this decision and implement getUser() with React cache().
 *
 * ## Security Properties
 *
 * - Uses `claims.app_metadata.role` (tamper-proof, service-role-only)
 * - NEVER uses `claims.user_metadata.role` (user-controllable)
 * - Logs all auth failures for security audit
 * - Rate limits every action (60 req/min per user)
 * - Throws on failure — never returns error state
 *
 * @param context - Action context for logging
 * @param context.action - Action name (e.g., "list_patients", "create_appointment")
 * @param context.requiredRole - Optional role requirement (uses app_metadata)
 * @returns Object with userId and claims: { userId: string, claims: AuthClaims }
 * @throws Error on auth failure (logged for audit) or rate limit exceeded
 *
 * @see {@link https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs}
 * @see {@link https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv}
 */
"use server"

import { logServerEvent } from "@workspace/logging/server"
import { getClaims } from "@workspace/supabase-auth/session/get-claims"

import { checkActionRateLimit } from "./rate-limit"

interface RequireAuthContext {
  action: string
  requiredRole?: string
}

interface AuthClaims {
  sub: string
  app_metadata: {
    role?: string
    [key: string]: unknown
  }
  user_metadata: Record<string, unknown>
  [key: string]: unknown
}

/**
 * RequireAuth return type
 *
 * Returns both userId (for convenience) and full claims object.
 */
interface RequireAuthResult {
  userId: string
  claims: AuthClaims
}

export async function requireAuth(context: RequireAuthContext): Promise<RequireAuthResult> {
  // 1. Identity resolution via getClaims() (JWKS cached, ~0.1-1ms)
  const claims = (await getClaims()) as AuthClaims | null

  if (!claims?.sub) {
    // Log unauthorized attempt (compliance requirement)
    await logServerEvent({
      actorId: "anonymous",
      actorType: "unknown",
      component: "auth.require-auth",
      durationMs: 0,
      eventFamily: "security.audit",
      eventName: "unauthorized_action_attempt",
      metadata: {
        action: context.action,
        requiredRole: context.requiredRole ?? "none",
      },
      operation: context.action,
      operationType: "auth",
      outcome: "failure",
      service: "supabase-data",
    })

    throw new Error("Unauthorized")
  }

  // 2. Rate limit check (after identity verification)
  await checkActionRateLimit(claims.sub)

  // 3. Role check (if required) — use app_metadata only (tamper-proof)
  if (context.requiredRole) {
    const role = (claims.app_metadata as { role?: string })?.role

    if (role !== context.requiredRole) {
      await logServerEvent({
        actorId: claims.sub,
        actorType: "user",
        component: "auth.require-auth",
        durationMs: 0,
        eventFamily: "security.audit",
        eventName: "insufficient_role",
        metadata: {
          action: context.action,
          actualRole: role ?? "none",
          requiredRole: context.requiredRole,
        },
        operation: context.action,
        operationType: "auth",
        outcome: "failure",
        service: "supabase-data",
      })

      throw new Error(`Access denied: ${context.requiredRole} role required`)
    }
  }

  // Return both userId and full claims object
  const result: RequireAuthResult = {
    userId: claims.sub,
    claims: claims,
  }

  return result
}

/**
 * Require specific role — convenience wrapper
 *
 * @example
 * ```typescript
 * const { userId, claims } = await requireRole("admin", { action: "list_audit_logs" })
 * ```
 */
export async function requireRole(
  role: string,
  context: { action: string }
): Promise<RequireAuthResult> {
  return requireAuth({ ...context, requiredRole: role })
}
