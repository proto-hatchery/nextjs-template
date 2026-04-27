/**
 * findByIdPsychologistInvoicesAction
 *
 * @module @workspace/supabase-data/actions/financial/psychologist-invoices-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistInvoicesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-invoices.dto.codegen"
import { PsychologistInvoicesSupabaseRepository } from "@workspace/supabase-data/modules/financial/infrastructure/repositories/psychologist-invoices-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistInvoicesFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type PsychologistInvoicesFindByIdInput = z.infer<
  typeof PsychologistInvoicesFindByIdInputSchema
>
export type PsychologistInvoicesFindByIdOutput = PsychologistInvoicesDTO | null

export async function findByIdPsychologistInvoicesAction(
  input: PsychologistInvoicesFindByIdInput
): Promise<PsychologistInvoicesFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_psychologist-invoices" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistInvoicesFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistInvoicesSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "financial.psychologist-invoices.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-invoices_success",
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
      component: "financial.psychologist-invoices.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_psychologist-invoices_failed",
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
