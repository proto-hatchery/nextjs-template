// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistFinancialEntriesDTOSchema,
  type PsychologistFinancialEntriesDTO,
} from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-financial-entries.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistFinancialEntriesRow =
  Database["public"]["Tables"]["psychologist_financial_entries"]["Row"]
type PsychologistFinancialEntriesInsert =
  Database["public"]["Tables"]["psychologist_financial_entries"]["Insert"]
type PsychologistFinancialEntriesUpdate =
  Database["public"]["Tables"]["psychologist_financial_entries"]["Update"]

const PsychologistFinancialEntriesFieldMappings = {
  amount: "amount",
  attachmentUrl: "attachment_url",
  billingId: "billing_id",
  chargeId: "charge_id",
  chargesCount: "charges_count",
  consolidationType: "consolidation_type",
  createdAt: "created_at",
  createdBy: "created_by",
  dateTime: "date_time",
  description: "description",
  id: "id",
  isAutomaticallyGenerated: "is_automatically_generated",
  notes: "notes",
  parentRecurrenceId: "parent_recurrence_id",
  paymentMethod: "payment_method",
  psychologistId: "psychologist_id",
  sessionId: "session_id",
  status: "status",
  transactionCategoryId: "transaction_category_id",
  type: "type",
  updatedAt: "updated_at",
  updatedBy: "updated_by",
  weeklyPeriodEnd: "weekly_period_end",
  weeklyPeriodStart: "weekly_period_start",
} as const

type PsychologistFinancialEntriesField = keyof typeof PsychologistFinancialEntriesFieldMappings

function fromPsychologistFinancialEntriesRow(
  row: PsychologistFinancialEntriesRow
): PsychologistFinancialEntriesDTO {
  const mapped = {
    amount: row.amount,
    attachmentUrl: row.attachment_url,
    billingId: row.billing_id,
    chargeId: row.charge_id,
    chargesCount: row.charges_count,
    consolidationType: row.consolidation_type,
    createdAt: row.created_at,
    createdBy: row.created_by,
    dateTime: row.date_time,
    description: row.description,
    id: row.id,
    isAutomaticallyGenerated: row.is_automatically_generated,
    notes: row.notes,
    parentRecurrenceId: row.parent_recurrence_id,
    paymentMethod: row.payment_method,
    psychologistId: row.psychologist_id,
    sessionId: row.session_id,
    status: row.status,
    transactionCategoryId: row.transaction_category_id,
    type: row.type,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    weeklyPeriodEnd: row.weekly_period_end,
    weeklyPeriodStart: row.weekly_period_start,
  }
  return PsychologistFinancialEntriesDTOSchema.parse(mapped)
}

function toPsychologistFinancialEntriesInsert(
  dto: Partial<PsychologistFinancialEntriesDTO>
): PsychologistFinancialEntriesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(
    PsychologistFinancialEntriesFieldMappings
  ) as Array<
    [
      PsychologistFinancialEntriesField,
      (typeof PsychologistFinancialEntriesFieldMappings)[PsychologistFinancialEntriesField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistFinancialEntriesInsert
}

function toPsychologistFinancialEntriesUpdate(
  dto: Partial<PsychologistFinancialEntriesDTO>
): PsychologistFinancialEntriesUpdate {
  return toPsychologistFinancialEntriesInsert(dto) as PsychologistFinancialEntriesUpdate
}

export {
  fromPsychologistFinancialEntriesRow,
  toPsychologistFinancialEntriesInsert,
  toPsychologistFinancialEntriesUpdate,
}
