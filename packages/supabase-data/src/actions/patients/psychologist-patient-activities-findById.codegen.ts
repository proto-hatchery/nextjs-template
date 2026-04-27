/**
 * findByIdPsychologistPatientActivitiesAction
 *
 * @module @workspace/supabase-data/actions/patients/psychologist-patient-activities-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPatientActivitiesDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-activities.dto.codegen"
import { PsychologistPatientActivitiesSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-activities-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientActivitiesFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type PsychologistPatientActivitiesFindByIdInput = z.infer<
  typeof PsychologistPatientActivitiesFindByIdInputSchema
>
export type PsychologistPatientActivitiesFindByIdOutput = PsychologistPatientActivitiesDTO | null

export async function findByIdPsychologistPatientActivitiesAction(
  input: PsychologistPatientActivitiesFindByIdInput
): Promise<PsychologistPatientActivitiesFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_psychologist-patient-activities" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientActivitiesFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientActivitiesSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-activities.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-patient-activities_success",
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
      component: "patients.psychologist-patient-activities.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-patient-activities_failed",
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
