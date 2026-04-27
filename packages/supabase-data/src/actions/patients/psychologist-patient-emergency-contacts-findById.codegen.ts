/**
 * findByIdPsychologistPatientEmergencyContactsAction
 *
 * @module @workspace/supabase-data/actions/patients/psychologist-patient-emergency-contacts-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPatientEmergencyContactsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-emergency-contacts.dto.codegen"
import { PsychologistPatientEmergencyContactsSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-emergency-contacts-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientEmergencyContactsFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type PsychologistPatientEmergencyContactsFindByIdInput = z.infer<
  typeof PsychologistPatientEmergencyContactsFindByIdInputSchema
>
export type PsychologistPatientEmergencyContactsFindByIdOutput =
  PsychologistPatientEmergencyContactsDTO | null

export async function findByIdPsychologistPatientEmergencyContactsAction(
  input: PsychologistPatientEmergencyContactsFindByIdInput
): Promise<PsychologistPatientEmergencyContactsFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({
    action: "findById_psychologist-patient-emergency-contacts",
  })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientEmergencyContactsFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientEmergencyContactsSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-emergency-contacts.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-patient-emergency-contacts_success",
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
      component: "patients.psychologist-patient-emergency-contacts.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-patient-emergency-contacts_failed",
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
