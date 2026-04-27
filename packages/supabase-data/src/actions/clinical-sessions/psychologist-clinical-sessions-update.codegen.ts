/**
 * updatePsychologistClinicalSessionsAction
 *
 * @module @workspace/supabase-data/actions/clinical-sessions/psychologist-clinical-sessions-update.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistClinicalSessionsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/psychologist-clinical-sessions.dto.codegen"
import { PsychologistClinicalSessionsSupabaseRepository } from "@workspace/supabase-data/modules/clinical-sessions/infrastructure/repositories/psychologist-clinical-sessions-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistClinicalSessionsUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      attendanceConfirmed: z.boolean().nullable().optional(),
      automationMetadata: z
        .union([z.string(), z.number(), z.boolean(), z.null()])
        .nullable()
        .optional(),
      billingAttemptCount: z.number().nullable().optional(),
      billingLastError: z.string().nullable().optional(),
      billingNextAttemptAt: z.string().nullable().optional(),
      billingStatus: z.string().nullable().optional(),
      calendarEventId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      confirmationSentAt: z.string().nullable().optional(),
      createdBy: z.string().nullable().optional(),
      customPriceCents: z.number().nullable().optional(),
      defaultChargeId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      durationMinutes: z.number().nullable().optional(),
      locationId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      noteId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      notes: z.string().nullable().optional(),
      psychologistId: z.uuid({ error: "Invalid UUID" }).optional(),
      psychologistPatientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      psychologistServiceId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      reminderSentAt: z.string().nullable().optional(),
      sessionNumber: z.number().nullable().optional(),
      snapshotPrice: z.number().nullable().optional(),
      snapshotPriceCents: z.number().nullable().optional(),
      snapshotServiceName: z.string().nullable().optional(),
      startTime: z.string().optional(),
      status: z.string().nullable().optional(),
      statusReason: z.string().nullable().optional(),
      updatedBy: z.string().nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type PsychologistClinicalSessionsUpdateInput = z.infer<
  typeof PsychologistClinicalSessionsUpdateInputSchema
>
export type PsychologistClinicalSessionsUpdateOutput = PsychologistClinicalSessionsDTO

export async function updatePsychologistClinicalSessionsAction(
  input: PsychologistClinicalSessionsUpdateInput
): Promise<PsychologistClinicalSessionsUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_psychologist-clinical-sessions" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistClinicalSessionsUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistClinicalSessionsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistClinicalSessionsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistClinicalSessionsDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "clinical-sessions.psychologist-clinical-sessions.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-clinical-sessions_success",
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
      component: "clinical-sessions.psychologist-clinical-sessions.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-clinical-sessions_failed",
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
