/**
 * updatePsychologistFinancialEntriesAction
 *
 * @module @workspace/supabase-data/actions/financial/psychologist-financial-entries-update.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistFinancialEntriesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-financial-entries.dto.codegen"
import { PsychologistFinancialEntriesSupabaseRepository } from "@workspace/supabase-data/modules/financial/infrastructure/repositories/psychologist-financial-entries-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistFinancialEntriesUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      amount: z.number().optional(),
      attachmentUrl: z.string().nullable().optional(),
      billingId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      chargeId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      chargesCount: z.number().nullable().optional(),
      consolidationType: z.string().nullable().optional(),
      createdBy: z.string().nullable().optional(),
      dateTime: z.string().optional(),
      description: z.string().nullable().optional(),
      isAutomaticallyGenerated: z.boolean().nullable().optional(),
      notes: z.string().nullable().optional(),
      parentRecurrenceId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      paymentMethod: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
      psychologistId: z.uuid({ error: "Invalid UUID" }).optional(),
      sessionId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      status: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
      transactionCategoryId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      type: z.string().optional(),
      updatedBy: z.string().nullable().optional(),
      weeklyPeriodEnd: z.string().nullable().optional(),
      weeklyPeriodStart: z.string().nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type PsychologistFinancialEntriesUpdateInput = z.infer<
  typeof PsychologistFinancialEntriesUpdateInputSchema
>
export type PsychologistFinancialEntriesUpdateOutput = PsychologistFinancialEntriesDTO

export async function updatePsychologistFinancialEntriesAction(
  input: PsychologistFinancialEntriesUpdateInput
): Promise<PsychologistFinancialEntriesUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_psychologist-financial-entries" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistFinancialEntriesUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistFinancialEntriesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistFinancialEntriesDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistFinancialEntriesDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "financial.psychologist-financial-entries.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-financial-entries_success",
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
      component: "financial.psychologist-financial-entries.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-financial-entries_failed",
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
