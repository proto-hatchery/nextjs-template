/**
 * deletePsychologistPatientMedicalItemsAction
 *
 * @module @workspace/supabase-data/actions/patients/psychologist-patient-medical-items-delete.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { PsychologistPatientMedicalItemsSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-medical-items-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientMedicalItemsDeleteInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type PsychologistPatientMedicalItemsDeleteInput = z.infer<
  typeof PsychologistPatientMedicalItemsDeleteInputSchema
>
export type PsychologistPatientMedicalItemsDeleteOutput = { success: true }

export async function deletePsychologistPatientMedicalItemsAction(
  input: PsychologistPatientMedicalItemsDeleteInput
): Promise<PsychologistPatientMedicalItemsDeleteOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "delete_psychologist-patient-medical-items" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientMedicalItemsDeleteInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientMedicalItemsSupabaseRepository(supabase)
    await repository.delete(validated.id)
    const result = { success: true } as const

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-medical-items.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_psychologist-patient-medical-items_success",
      operation: "delete",
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
      component: "patients.psychologist-patient-medical-items.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_psychologist-patient-medical-items_failed",
      operation: "delete",
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
