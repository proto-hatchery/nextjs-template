/**
 * updatePsychologistPatientActivitiesAction
 *
 * @module @workspace/supabase-data/actions/patients/psychologist-patient-activities-update.codegen
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

const PsychologistPatientActivitiesUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      activityId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      assignedAt: z.string().nullable().optional(),
      completedAt: z.string().nullable().optional(),
      createdBy: z.string().nullable().optional(),
      dueDate: z.string().nullable().optional(),
      instructions: z.string().nullable().optional(),
      isArchived: z.boolean().nullable().optional(),
      patientFeedback: z.string().nullable().optional(),
      patientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      psychologistClientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      psychologistId: z.uuid({ error: "Invalid UUID" }).optional(),
      responseData: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
      status: z.string().nullable().optional(),
      submittedAt: z.string().nullable().optional(),
      therapistComment: z.string().nullable().optional(),
      title: z.string().nullable().optional(),
      updatedBy: z.string().nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type PsychologistPatientActivitiesUpdateInput = z.infer<
  typeof PsychologistPatientActivitiesUpdateInputSchema
>
export type PsychologistPatientActivitiesUpdateOutput = PsychologistPatientActivitiesDTO

export async function updatePsychologistPatientActivitiesAction(
  input: PsychologistPatientActivitiesUpdateInput
): Promise<PsychologistPatientActivitiesUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_psychologist-patient-activities" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientActivitiesUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientActivitiesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistPatientActivitiesDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistPatientActivitiesDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-activities.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-patient-activities_success",
      operation: "update",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? validated.id,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "patients.psychologist-patient-activities.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-patient-activities_failed",
      operation: "update",
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
