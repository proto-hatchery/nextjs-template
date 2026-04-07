/**
 * FindByIdSessionTypes Server Action
 * 
 * Handles findById operation for session_types.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { findByIdSessionTypesAction } from "@workspace/supabase-data/actions/catalog/session-types-findById.codegen"
 * 
 * const result = await findByIdSessionTypesAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/catalog/session-types-findById
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { SessionTypesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/session-types-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for findByIdSessionTypesAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const SessionTypesFindByIdInputSchema = z.object({
  // TODO: Define input fields based on session_types.findById requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for findByIdSessionTypesAction
 */
export type SessionTypesFindByIdInput = z.infer<typeof SessionTypesFindByIdInputSchema>

/**
 * Output type for findByIdSessionTypesAction — unknown until the action is wired to real DTOs / port types.
 */
export type SessionTypesFindByIdOutput = unknown

/**
 * FindByIdSessionTypes Server Action
 * 
 * @param input - Action input
 */
export async function findByIdSessionTypesAction(
  input: SessionTypesFindByIdInput
): Promise<SessionTypesFindByIdOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "findById_session-types",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = SessionTypesFindByIdInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new SessionTypesSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — id shape from validated after TODO input schema
    const result = await repository.findById((validated as unknown as { id: string }).id)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "catalog.session-types.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_session-types_success",
      operation: "findById",
      operationType: "action",
      outcome: "success",
      service: "supabase-data",
    })

    return result
  } catch (error) {
    // 6. Log error with sanitized metadata (HIPAA compliant)
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "catalog.session-types.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_session-types_failed",
      operation: "findById",
      operationType: "action",
      outcome: "failure",
      error,
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
