/**
 * listPsychologistFinancialEntriesAction
 *
 * @module @workspace/supabase-data/actions/financial/psychologist-financial-entries-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistFinancialEntriesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-financial-entries.dto.codegen"
import type { PsychologistFinancialEntriesListParams } from "@workspace/supabase-data/modules/financial/domain/ports/psychologist-financial-entries-repository.port.codegen"
import { PsychologistFinancialEntriesSupabaseRepository } from "@workspace/supabase-data/modules/financial/infrastructure/repositories/psychologist-financial-entries-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistFinancialEntriesListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type PsychologistFinancialEntriesListInput = z.infer<
  typeof PsychologistFinancialEntriesListInputSchema
>
export type PsychologistFinancialEntriesListOutput = { rows: PsychologistFinancialEntriesDTO[] }

export async function listPsychologistFinancialEntriesAction(
  input: PsychologistFinancialEntriesListInput
): Promise<PsychologistFinancialEntriesListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_psychologist-financial-entries" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistFinancialEntriesListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistFinancialEntriesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies PsychologistFinancialEntriesListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as PsychologistFinancialEntriesListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "financial.psychologist-financial-entries.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-financial-entries_success",
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
      component: "financial.psychologist-financial-entries.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-financial-entries_failed",
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
