/**
 * updatePsychologistPatientChargesAction
 *
 * @module @workspace/supabase-data/actions/financial/psychologist-patient-charges-update.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPatientChargesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-patient-charges.dto.codegen"
import { PsychologistPatientChargesSupabaseRepository } from "@workspace/supabase-data/modules/financial/infrastructure/repositories/psychologist-patient-charges-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPatientChargesUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      attachmentUrl: z.string().nullable().optional(),
      createdBy: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      documentStatus: z.string().nullable().optional(),
      dueDate: z.string().nullable().optional(),
      invoiceNumber: z.string().nullable().optional(),
      invoiceUrl: z.string().nullable().optional(),
      lastSentAt: z.string().nullable().optional(),
      paidAt: z.string().nullable().optional(),
      paymentMethod: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
      paymentNotes: z.string().nullable().optional(),
      paymentStatus: z.string().nullable().optional(),
      priceCents: z.number().nullable().optional(),
      psychologistId: z.uuid({ error: "Invalid UUID" }).optional(),
      psychologistPatientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      sentCount: z.number().nullable().optional(),
      sessionId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      updatedBy: z.string().nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type PsychologistPatientChargesUpdateInput = z.infer<
  typeof PsychologistPatientChargesUpdateInputSchema
>
export type PsychologistPatientChargesUpdateOutput = PsychologistPatientChargesDTO

export async function updatePsychologistPatientChargesAction(
  input: PsychologistPatientChargesUpdateInput
): Promise<PsychologistPatientChargesUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_psychologist-patient-charges" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPatientChargesUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPatientChargesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistPatientChargesDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistPatientChargesDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "financial.psychologist-patient-charges.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-patient-charges_success",
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
      component: "financial.psychologist-patient-charges.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-patient-charges_failed",
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
