/**
 * listPsychologistPatientAssessmentsAction
 *
 * @module @workspace/supabase-data/actions/patients/psychologist-patient-assessments-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPatientAssessmentsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-assessments.dto.codegen"
import type { PsychologistPatientAssessmentsListParams } from "@workspace/supabase-data/modules/patients/domain/ports/psychologist-patient-assessments-repository.port.codegen"
import { PsychologistPatientAssessmentsSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-assessments-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientAssessmentsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type PsychologistPatientAssessmentsListInput = z.infer<
  typeof PsychologistPatientAssessmentsListInputSchema
>
export type PsychologistPatientAssessmentsListOutput = { rows: PsychologistPatientAssessmentsDTO[] }

export async function listPsychologistPatientAssessmentsAction(
  input: PsychologistPatientAssessmentsListInput
): Promise<PsychologistPatientAssessmentsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_psychologist-patient-assessments" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientAssessmentsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientAssessmentsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies PsychologistPatientAssessmentsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as PsychologistPatientAssessmentsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-assessments.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-patient-assessments_success",
      operation: "list",
      operationType: "action",
      outcome: "success",
      metadata: {
        rowCount: result.rows.length,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-assessments.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-patient-assessments_failed",
      operation: "list",
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
