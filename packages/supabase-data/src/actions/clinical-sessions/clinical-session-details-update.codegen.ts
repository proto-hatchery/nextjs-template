/**
 * updateClinicalSessionDetailsAction
 *
 * @module @workspace/supabase-data/actions/clinical-sessions/clinical-session-details-update.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { ClinicalSessionDetailsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/clinical-session-details.dto.codegen"
import { ClinicalSessionDetailsSupabaseRepository } from "@workspace/supabase-data/modules/clinical-sessions/infrastructure/repositories/clinical-session-details-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const ClinicalSessionDetailsUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      attendanceConfirmed: z.boolean().nullable().optional(),
      billingAttemptCount: z.number().optional(),
      billingLastAttemptAt: z.string().nullable().optional(),
      billingLastError: z.string().nullable().optional(),
      billingNextAttemptAt: z.string().nullable().optional(),
      billingStatus: z.string().nullable().optional(),
      calendarEventId: z.uuid({ error: "Invalid UUID" }).optional(),
      clinicalSessionId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      confirmationSentAt: z.string().nullable().optional(),
      patientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      psychologistClientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      psychologistServiceId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      reminderSentAt: z.string().nullable().optional(),
      sessionNumber: z.number().nullable().optional(),
      sessionTypeId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type ClinicalSessionDetailsUpdateInput = z.infer<
  typeof ClinicalSessionDetailsUpdateInputSchema
>
export type ClinicalSessionDetailsUpdateOutput = ClinicalSessionDetailsDTO

export async function updateClinicalSessionDetailsAction(
  input: ClinicalSessionDetailsUpdateInput
): Promise<ClinicalSessionDetailsUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_clinical-session-details" })
  const actorIdForLog = userId

  try {
    const validated = ClinicalSessionDetailsUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new ClinicalSessionDetailsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<ClinicalSessionDetailsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<ClinicalSessionDetailsDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "clinical-sessions.clinical-session-details.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_clinical-session-details_success",
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
      component: "clinical-sessions.clinical-session-details.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_clinical-session-details_failed",
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
