/**
 * insertPsychologistPatientEmergencyContactsAction
 *
 * @module @workspace/supabase-data/actions/patients/psychologist-patient-emergency-contacts-insert.codegen
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

const PsychologistPatientEmergencyContactsInsertInputSchema = z.object({
  contactName: z.string(),
  createdBy: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  isPrimary: z.boolean().nullable().optional(),
  notes: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  psychologistPatientId: z.uuid({ error: "Invalid UUID" }),
  relationship: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
})

export type PsychologistPatientEmergencyContactsInsertInput = z.infer<
  typeof PsychologistPatientEmergencyContactsInsertInputSchema
>
export type PsychologistPatientEmergencyContactsInsertOutput =
  PsychologistPatientEmergencyContactsDTO

export async function insertPsychologistPatientEmergencyContactsAction(
  input: PsychologistPatientEmergencyContactsInsertInput
): Promise<PsychologistPatientEmergencyContactsInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_psychologist-patient-emergency-contacts" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientEmergencyContactsInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientEmergencyContactsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistPatientEmergencyContactsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistPatientEmergencyContactsDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-emergency-contacts.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-patient-emergency-contacts_success",
      operation: "insert",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? null,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-emergency-contacts.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-patient-emergency-contacts_failed",
      operation: "insert",
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
