/**
 * insertPsychologistInvoicesAction
 *
 * @module @workspace/supabase-data/actions/financial/psychologist-invoices-insert.codegen
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

const PsychologistInvoicesInsertInputSchema = z.object({
  amountPaid: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  hostedInvoiceUrl: z.string().nullable().optional(),
  invoicePdf: z.string().nullable().optional(),
  periodEnd: z.string().nullable().optional(),
  periodStart: z.string().nullable().optional(),
  psychologistId: z.uuid({ error: "Invalid UUID" }),
  status: z.string().nullable().optional(),
  stripeInvoiceId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  stripeSubscriptionId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
})

export type PsychologistInvoicesInsertInput = z.infer<typeof PsychologistInvoicesInsertInputSchema>
export type PsychologistInvoicesInsertOutput = PsychologistInvoicesDTO

export async function insertPsychologistInvoicesAction(
  input: PsychologistInvoicesInsertInput
): Promise<PsychologistInvoicesInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_psychologist-invoices" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistInvoicesInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistInvoicesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistInvoicesDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistInvoicesDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "financial.psychologist-invoices.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-invoices_success",
      operation: "insert",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? null,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "financial.psychologist-invoices.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-invoices_failed",
      operation: "insert",
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
