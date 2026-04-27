/**
 * insertPsychologistPatientAssessmentsAction
 *
 * @module @workspace/supabase-data/actions/patients/psychologist-patient-assessments-insert.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPatientAssessmentsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-assessments.dto.codegen"
import { PsychologistPatientAssessmentsSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-assessments-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientAssessmentsInsertInputSchema = z.object({
  appliedAt: z.string().nullable().optional(),
  clinicalNoteId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  createdBy: z.string().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
  interpretation: z.string().nullable().optional(),
  isArchived: z.boolean().nullable().optional(),
  name: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  patientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  psychologistClientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  psychologistId: z.uuid({ error: "Invalid UUID" }),
  psychologistNotes: z.string().nullable().optional(),
  results: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  testDate: z.string().nullable().optional(),
  testId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  testName: z.string().nullable().optional(),
  testType: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
})

export type PsychologistPatientAssessmentsInsertInput = z.infer<
  typeof PsychologistPatientAssessmentsInsertInputSchema
>
export type PsychologistPatientAssessmentsInsertOutput = PsychologistPatientAssessmentsDTO

export async function insertPsychologistPatientAssessmentsAction(
  input: PsychologistPatientAssessmentsInsertInput
): Promise<PsychologistPatientAssessmentsInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_psychologist-patient-assessments" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientAssessmentsInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientAssessmentsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistPatientAssessmentsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistPatientAssessmentsDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-assessments.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-patient-assessments_success",
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
      component: "patients.psychologist-patient-assessments.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-patient-assessments_failed",
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
