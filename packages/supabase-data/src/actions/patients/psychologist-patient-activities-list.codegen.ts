/**
 * listPsychologistPatientActivitiesAction
 *
 * @module @workspace/supabase-data/actions/patients/psychologist-patient-activities-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPatientActivitiesDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patient-activities.dto.codegen"
import type { PsychologistPatientActivitiesListParams } from "@workspace/supabase-data/modules/patients/domain/ports/psychologist-patient-activities-repository.port.codegen"
import { PsychologistPatientActivitiesSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-activities-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientActivitiesListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type PsychologistPatientActivitiesListInput = z.infer<
  typeof PsychologistPatientActivitiesListInputSchema
>
export type PsychologistPatientActivitiesListOutput = { rows: PsychologistPatientActivitiesDTO[] }

export async function listPsychologistPatientActivitiesAction(
  input: PsychologistPatientActivitiesListInput
): Promise<PsychologistPatientActivitiesListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_psychologist-patient-activities" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientActivitiesListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientActivitiesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies PsychologistPatientActivitiesListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as PsychologistPatientActivitiesListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-activities.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-patient-activities_success",
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
      component: "patients.psychologist-patient-activities.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-patient-activities_failed",
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
