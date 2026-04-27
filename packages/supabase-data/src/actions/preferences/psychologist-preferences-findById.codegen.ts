/**
 * findByIdPsychologistPreferencesAction
 *
 * @module @workspace/supabase-data/actions/preferences/psychologist-preferences-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPreferencesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-preferences.dto.codegen"
import { PsychologistPreferencesSupabaseRepository } from "@workspace/supabase-data/modules/preferences/infrastructure/repositories/psychologist-preferences-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPreferencesFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type PsychologistPreferencesFindByIdInput = z.infer<
  typeof PsychologistPreferencesFindByIdInputSchema
>
export type PsychologistPreferencesFindByIdOutput = PsychologistPreferencesDTO | null

export async function findByIdPsychologistPreferencesAction(
  input: PsychologistPreferencesFindByIdInput
): Promise<PsychologistPreferencesFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_psychologist-preferences" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPreferencesFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPreferencesSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "preferences.psychologist-preferences.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-preferences_success",
      operation: "findById",
      operationType: "action",
      outcome: "success",
      metadata: {
        id: validated.id,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "preferences.psychologist-preferences.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-preferences_failed",
      operation: "findById",
      operationType: "action",
      outcome: "failure",
      error,
      // @type-escape: input type is the generated Zod-inferred shape; Record<string,unknown> is required by sanitizeForAudit — diverges at the catch boundary where input may be unvalidated
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
