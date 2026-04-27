/**
 * listPsychologistInvoicesAction
 *
 * @module @workspace/supabase-data/actions/financial/psychologist-invoices-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistInvoicesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-invoices.dto.codegen"
import type { PsychologistInvoicesListParams } from "@workspace/supabase-data/modules/financial/domain/ports/psychologist-invoices-repository.port.codegen"
import { PsychologistInvoicesSupabaseRepository } from "@workspace/supabase-data/modules/financial/infrastructure/repositories/psychologist-invoices-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistInvoicesListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type PsychologistInvoicesListInput = z.infer<typeof PsychologistInvoicesListInputSchema>
export type PsychologistInvoicesListOutput = { rows: PsychologistInvoicesDTO[] }

export async function listPsychologistInvoicesAction(
  input: PsychologistInvoicesListInput
): Promise<PsychologistInvoicesListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_psychologist-invoices" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistInvoicesListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistInvoicesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies PsychologistInvoicesListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as PsychologistInvoicesListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "financial.psychologist-invoices.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-invoices_success",
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
      component: "financial.psychologist-invoices.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-invoices_failed",
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
