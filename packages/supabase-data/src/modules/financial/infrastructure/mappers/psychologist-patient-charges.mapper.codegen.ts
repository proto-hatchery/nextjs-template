// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistPatientChargesDTOSchema,
  type PsychologistPatientChargesDTO,
} from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-patient-charges.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistPatientChargesRow =
  Database["public"]["Tables"]["psychologist_patient_charges"]["Row"]
type PsychologistPatientChargesInsert =
  Database["public"]["Tables"]["psychologist_patient_charges"]["Insert"]
type PsychologistPatientChargesUpdate =
  Database["public"]["Tables"]["psychologist_patient_charges"]["Update"]

const PsychologistPatientChargesFieldMappings = {
  attachmentUrl: "attachment_url",
  createdAt: "created_at",
  createdBy: "created_by",
  description: "description",
  documentStatus: "document_status",
  dueDate: "due_date",
  id: "id",
  invoiceNumber: "invoice_number",
  invoiceUrl: "invoice_url",
  lastSentAt: "last_sent_at",
  paidAt: "paid_at",
  paymentMethod: "payment_method",
  paymentNotes: "payment_notes",
  paymentStatus: "payment_status",
  priceCents: "price_cents",
  psychologistId: "psychologist_id",
  psychologistPatientId: "psychologist_patient_id",
  sentCount: "sent_count",
  sessionId: "session_id",
  updatedAt: "updated_at",
  updatedBy: "updated_by",
} as const

type PsychologistPatientChargesField = keyof typeof PsychologistPatientChargesFieldMappings

function fromPsychologistPatientChargesRow(
  row: PsychologistPatientChargesRow
): PsychologistPatientChargesDTO {
  const mapped = {
    attachmentUrl: row.attachment_url,
    createdAt: row.created_at,
    createdBy: row.created_by,
    description: row.description,
    documentStatus: row.document_status,
    dueDate: row.due_date,
    id: row.id,
    invoiceNumber: row.invoice_number,
    invoiceUrl: row.invoice_url,
    lastSentAt: row.last_sent_at,
    paidAt: row.paid_at,
    paymentMethod: row.payment_method,
    paymentNotes: row.payment_notes,
    paymentStatus: row.payment_status,
    priceCents: row.price_cents,
    psychologistId: row.psychologist_id,
    psychologistPatientId: row.psychologist_patient_id,
    sentCount: row.sent_count,
    sessionId: row.session_id,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  }
  return PsychologistPatientChargesDTOSchema.parse(mapped)
}

function toPsychologistPatientChargesInsert(
  dto: Partial<PsychologistPatientChargesDTO>
): PsychologistPatientChargesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(
    PsychologistPatientChargesFieldMappings
  ) as Array<
    [
      PsychologistPatientChargesField,
      (typeof PsychologistPatientChargesFieldMappings)[PsychologistPatientChargesField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistPatientChargesInsert
}

function toPsychologistPatientChargesUpdate(
  dto: Partial<PsychologistPatientChargesDTO>
): PsychologistPatientChargesUpdate {
  return toPsychologistPatientChargesInsert(dto) as PsychologistPatientChargesUpdate
}

export {
  fromPsychologistPatientChargesRow,
  toPsychologistPatientChargesInsert,
  toPsychologistPatientChargesUpdate,
}
