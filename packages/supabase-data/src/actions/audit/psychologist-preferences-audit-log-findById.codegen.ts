/**
 * FindByIdPsychologistPreferencesAuditLog Server Action
 * 
 * Handles findById operation for psychologist_preferences_audit_log.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { findByIdPsychologistPreferencesAuditLogAction } from "@workspace/supabase-data/actions/audit/psychologist-preferences-audit-log-findById.codegen"
 * 
 * const result = await findByIdPsychologistPreferencesAuditLogAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/audit/psychologist-preferences-audit-log-findById
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { PsychologistPreferencesAuditLogSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/psychologist-preferences-audit-log-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for findByIdPsychologistPreferencesAuditLogAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const PsychologistPreferencesAuditLogFindByIdInputSchema = z.object({
  // TODO: Define input fields based on psychologist_preferences_audit_log.findById requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for findByIdPsychologistPreferencesAuditLogAction
 */
export type PsychologistPreferencesAuditLogFindByIdInput = z.infer<typeof PsychologistPreferencesAuditLogFindByIdInputSchema>

/**
 * Output type for findByIdPsychologistPreferencesAuditLogAction — unknown until the action is wired to real DTOs / port types.
 */
export type PsychologistPreferencesAuditLogFindByIdOutput = unknown

/**
 * FindByIdPsychologistPreferencesAuditLog Server Action
 * 
 * @param input - Action input
 */
export async function findByIdPsychologistPreferencesAuditLogAction(
  input: PsychologistPreferencesAuditLogFindByIdInput
): Promise<PsychologistPreferencesAuditLogFindByIdOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "findById_psychologist-preferences-audit-log",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = PsychologistPreferencesAuditLogFindByIdInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPreferencesAuditLogSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — id shape from validated after TODO input schema
    const result = await repository.findById((validated as unknown as { id: string }).id)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "audit.psychologist-preferences-audit-log.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-preferences-audit-log_success",
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
      component: "audit.psychologist-preferences-audit-log.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-preferences-audit-log_failed",
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
