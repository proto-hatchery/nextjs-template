/**
 * UpdatePsychologistNotes Server Action
 * 
 * Handles update operation for psychologist_notes.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { updatePsychologistNotesAction } from "@workspace/supabase-data/actions/notes/psychologist-notes-update.codegen"
 * 
 * const result = await updatePsychologistNotesAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/notes/psychologist-notes-update
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { PsychologistNotesSupabaseRepository } from "@workspace/supabase-data/modules/notes/infrastructure/repositories/psychologist-notes-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for updatePsychologistNotesAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const PsychologistNotesUpdateInputSchema = z.object({
  // TODO: Define input fields based on psychologist_notes.update requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for updatePsychologistNotesAction
 */
export type PsychologistNotesUpdateInput = z.infer<typeof PsychologistNotesUpdateInputSchema>

/**
 * Output type for updatePsychologistNotesAction — unknown until the action is wired to real DTOs / port types.
 */
export type PsychologistNotesUpdateOutput = unknown

/**
 * UpdatePsychologistNotes Server Action
 * 
 * @param input - Action input
 */
export async function updatePsychologistNotesAction(
  input: PsychologistNotesUpdateInput
): Promise<PsychologistNotesUpdateOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "update_psychologist-notes",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = PsychologistNotesUpdateInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new PsychologistNotesSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — id shape from validated after TODO input schema
    const validatedId = (validated as unknown as { id: string }).id
    // @type-escape: generated action stub — update patch unknown until TODO input schema
    const validatedPatch = validated as never
    const result = await repository.update(validatedId, validatedPatch)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "notes.psychologist-notes.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-notes_success",
      operation: "update",
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
      component: "notes.psychologist-notes.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-notes_failed",
      operation: "update",
      operationType: "action",
      outcome: "failure",
      error,
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
