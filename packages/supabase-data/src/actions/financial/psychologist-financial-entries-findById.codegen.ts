/**
 * findByIdPsychologistFinancialEntriesAction
 *
 * @module @workspace/supabase-data/actions/financial/psychologist-financial-entries-findById.codegen
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

const PsychologistFinancialEntriesFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type PsychologistFinancialEntriesFindByIdInput = z.infer<
  typeof PsychologistFinancialEntriesFindByIdInputSchema
>
export type PsychologistFinancialEntriesFindByIdOutput = PsychologistFinancialEntriesDTO | null

export async function findByIdPsychologistFinancialEntriesAction(
  input: PsychologistFinancialEntriesFindByIdInput
): Promise<PsychologistFinancialEntriesFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_psychologist-financial-entries" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistFinancialEntriesFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistFinancialEntriesSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "financial.psychologist-financial-entries.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-financial-entries_success",
      operation: "findById",
      operationType: "action",
      outcome: "success",
      metadata: {
        id: validated.id,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "financial.psychologist-financial-entries.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-financial-entries_failed",
      operation: "findById",
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
