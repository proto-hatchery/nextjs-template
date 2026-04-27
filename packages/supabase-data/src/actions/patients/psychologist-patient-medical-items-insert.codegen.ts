/**
 * insertPsychologistPatientMedicalItemsAction
 *
 * @module @workspace/supabase-data/actions/patients/psychologist-patient-medical-items-insert.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPatientMedicalItemsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-medical-items.dto.codegen"
import { PsychologistPatientMedicalItemsSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-medical-items-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientMedicalItemsInsertInputSchema = z.object({
  description: z.string().nullable().optional(),
  diagnosedDate: z.string().nullable().optional(),
  dosage: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  frequency: z.string().nullable().optional(),
  icd10Code: z.string().nullable().optional(),
  isActive: z.boolean().nullable().optional(),
  itemKind: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  kind: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  name: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  psychologistId: z.uuid({ error: "Invalid UUID" }),
  psychologistPatientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  startDate: z.string().nullable().optional(),
})

export type PsychologistPatientMedicalItemsInsertInput = z.infer<
  typeof PsychologistPatientMedicalItemsInsertInputSchema
>
export type PsychologistPatientMedicalItemsInsertOutput = PsychologistPatientMedicalItemsDTO

export async function insertPsychologistPatientMedicalItemsAction(
  input: PsychologistPatientMedicalItemsInsertInput
): Promise<PsychologistPatientMedicalItemsInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_psychologist-patient-medical-items" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientMedicalItemsInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientMedicalItemsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistPatientMedicalItemsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistPatientMedicalItemsDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-medical-items.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-patient-medical-items_success",
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
      component: "patients.psychologist-patient-medical-items.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-patient-medical-items_failed",
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
