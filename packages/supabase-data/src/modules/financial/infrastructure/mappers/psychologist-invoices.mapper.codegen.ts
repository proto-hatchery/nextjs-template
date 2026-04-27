// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistInvoicesDTOSchema,
  type PsychologistInvoicesDTO,
} from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-invoices.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistInvoicesRow = Database["public"]["Tables"]["psychologist_invoices"]["Row"]
type PsychologistInvoicesInsert = Database["public"]["Tables"]["psychologist_invoices"]["Insert"]
type PsychologistInvoicesUpdate = Database["public"]["Tables"]["psychologist_invoices"]["Update"]

const PsychologistInvoicesFieldMappings = {
  amountPaid: "amount_paid",
  createdAt: "created_at",
  currency: "currency",
  hostedInvoiceUrl: "hosted_invoice_url",
  id: "id",
  invoicePdf: "invoice_pdf",
  periodEnd: "period_end",
  periodStart: "period_start",
  psychologistId: "psychologist_id",
  status: "status",
  stripeInvoiceId: "stripe_invoice_id",
  stripeSubscriptionId: "stripe_subscription_id",
  updatedAt: "updated_at",
} as const

type PsychologistInvoicesField = keyof typeof PsychologistInvoicesFieldMappings

function fromPsychologistInvoicesRow(row: PsychologistInvoicesRow): PsychologistInvoicesDTO {
  const mapped = {
    amountPaid: row.amount_paid,
    createdAt: row.created_at,
    currency: row.currency,
    hostedInvoiceUrl: row.hosted_invoice_url,
    id: row.id,
    invoicePdf: row.invoice_pdf,
    periodEnd: row.period_end,
    periodStart: row.period_start,
    psychologistId: row.psychologist_id,
    status: row.status,
    stripeInvoiceId: row.stripe_invoice_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    updatedAt: row.updated_at,
  }
  return PsychologistInvoicesDTOSchema.parse(mapped)
}

function toPsychologistInvoicesInsert(
  dto: Partial<PsychologistInvoicesDTO>
): PsychologistInvoicesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(PsychologistInvoicesFieldMappings) as Array<
    [
      PsychologistInvoicesField,
      (typeof PsychologistInvoicesFieldMappings)[PsychologistInvoicesField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistInvoicesInsert
}

function toPsychologistInvoicesUpdate(
  dto: Partial<PsychologistInvoicesDTO>
): PsychologistInvoicesUpdate {
  return toPsychologistInvoicesInsert(dto) as PsychologistInvoicesUpdate
}

export { fromPsychologistInvoicesRow, toPsychologistInvoicesInsert, toPsychologistInvoicesUpdate }
