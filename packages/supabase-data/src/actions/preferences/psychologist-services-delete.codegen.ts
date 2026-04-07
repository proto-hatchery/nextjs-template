/**
 * DeletePsychologistServices Server Action
 * 
 * Handles delete operation for psychologist_services.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { deletePsychologistServicesAction } from "@workspace/supabase-data/actions/preferences/psychologist-services-delete.codegen"
 * 
 * const result = await deletePsychologistServicesAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/preferences/psychologist-services-delete
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { PsychologistServicesSupabaseRepository } from "@workspace/supabase-data/modules/preferences/infrastructure/repositories/psychologist-services-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for deletePsychologistServicesAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const PsychologistServicesDeleteInputSchema = z.object({
  // TODO: Define input fields based on psychologist_services.delete requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for deletePsychologistServicesAction
 */
export type PsychologistServicesDeleteInput = z.infer<typeof PsychologistServicesDeleteInputSchema>

/**
 * Output type for deletePsychologistServicesAction — unknown until the action is wired to real DTOs / port types.
 */
export type PsychologistServicesDeleteOutput = unknown

/**
 * DeletePsychologistServices Server Action
 * 
 * @param input - Action input
 */
export async function deletePsychologistServicesAction(
  input: PsychologistServicesDeleteInput
): Promise<PsychologistServicesDeleteOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "delete_psychologist-services",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = PsychologistServicesDeleteInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new PsychologistServicesSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — delete id unknown until TODO input schema
    await repository.delete((validated as unknown as { id: string }).id)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "preferences.psychologist-services.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_psychologist-services_success",
      operation: "delete",
      operationType: "action",
      outcome: "success",
      service: "supabase-data",
    })

    return null as PsychologistServicesDeleteOutput
  } catch (error) {
    // 6. Log error with sanitized metadata (HIPAA compliant)
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "preferences.psychologist-services.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_psychologist-services_failed",
      operation: "delete",
      operationType: "action",
      outcome: "failure",
      error,
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
