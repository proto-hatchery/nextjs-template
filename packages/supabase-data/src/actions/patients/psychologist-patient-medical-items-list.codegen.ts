/**
 * listPsychologistPatientMedicalItemsAction
 *
 * @module @workspace/supabase-data/actions/patients/psychologist-patient-medical-items-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPatientMedicalItemsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-medical-items.dto.codegen"
import type { PsychologistPatientMedicalItemsListParams } from "@workspace/supabase-data/modules/patients/domain/ports/psychologist-patient-medical-items-repository.port.codegen"
import { PsychologistPatientMedicalItemsSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-medical-items-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientMedicalItemsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type PsychologistPatientMedicalItemsListInput = z.infer<
  typeof PsychologistPatientMedicalItemsListInputSchema
>
export type PsychologistPatientMedicalItemsListOutput = {
  rows: PsychologistPatientMedicalItemsDTO[]
}

export async function listPsychologistPatientMedicalItemsAction(
  input: PsychologistPatientMedicalItemsListInput
): Promise<PsychologistPatientMedicalItemsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_psychologist-patient-medical-items" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientMedicalItemsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientMedicalItemsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies PsychologistPatientMedicalItemsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as PsychologistPatientMedicalItemsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-medical-items.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-patient-medical-items_success",
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
      component: "patients.psychologist-patient-medical-items.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-patient-medical-items_failed",
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
