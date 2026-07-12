import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  ChargeDTO,
  ChargeSummaryDTO,
  PaymentMethod,
  PaymentStatus,
} from "../../domain/dto/charge.dto";

/**
 * Database row type for charges
 */
type ChargeRow = Database["public"]["Tables"]["psychologist_patient_charges"]["Row"];

/**
 * Database insert type for charges
 */
type ChargeInsert = Database["public"]["Tables"]["psychologist_patient_charges"]["Insert"];

/**
 * Charge Mapper
 *
 * Converts between database rows and domain DTOs.
 * This is the only layer that knows about database schema details.
 */

/**
 * Convert database row to domain DTO
 *
 * Handles type narrowing from .select() queries.
 */
export function fromDatabaseRow(row: ChargeRow | Pick<ChargeRow, keyof ChargeRow>): ChargeDTO {
  return {
    id: row.id,
    psychologistId: row.psychologist_id,
    patientId: row.psychologist_patient_id ?? null,
    sessionId: row.session_id ?? null,
    priceCents: row.price_cents ?? 0,
    paymentStatus: (row.payment_status as PaymentStatus) ?? null,
    paymentMethod: (row.payment_method as PaymentMethod) ?? null,
    dueDate: row.due_date ?? null,
    paidAt: row.paid_at ?? null,
    description: row.description ?? null,
    paymentNotes: row.payment_notes ?? null,
    invoiceNumber: row.invoice_number ?? null,
    invoiceUrl: row.invoice_url ?? null,
    attachmentUrl: row.attachment_url ?? null,
    documentStatus: row.document_status ?? null,
    lastSentAt: row.last_sent_at ?? null,
    sentCount: row.sent_count ?? null,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
    createdBy: row.created_by ?? null,
    updatedBy: row.updated_by ?? null,
  };
}

/**
 * Convert database row to summary DTO (lightweight)
 */
export function fromDatabaseRowToSummary(
  row: Pick<
    ChargeRow,
    | "id"
    | "psychologist_patient_id"
    | "price_cents"
    | "payment_status"
    | "due_date"
    | "paid_at"
    | "created_at"
  >,
): ChargeSummaryDTO {
  return {
    id: row.id,
    patientId: row.psychologist_patient_id ?? null,
    priceCents: row.price_cents ?? 0,
    paymentStatus: (row.payment_status as PaymentStatus) ?? null,
    dueDate: row.due_date ?? null,
    paidAt: row.paid_at ?? null,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

/**
 * Convert domain DTO to database insert format
 */
export function toDatabaseInsert(
  dto: Omit<ChargeDTO, "id" | "createdAt" | "updatedAt">,
): ChargeInsert {
  return {
    psychologist_id: dto.psychologistId,
    psychologist_patient_id: dto.patientId,
    session_id: dto.sessionId,
    price_cents: dto.priceCents,
    payment_status: dto.paymentStatus,
    payment_method: dto.paymentMethod,
    due_date: dto.dueDate,
    paid_at: dto.paidAt,
    description: dto.description,
    payment_notes: dto.paymentNotes,
    invoice_number: dto.invoiceNumber,
    invoice_url: dto.invoiceUrl,
    attachment_url: dto.attachmentUrl,
    document_status: dto.documentStatus,
    last_sent_at: dto.lastSentAt,
    sent_count: dto.sentCount,
    created_by: dto.createdBy,
    updated_by: dto.updatedBy,
  };
}

/**
 * Convert partial domain DTO to database update format
 */
export function toDatabaseUpdate(
  updates: Partial<
    Omit<ChargeDTO, "id" | "psychologistId" | "createdAt" | "updatedAt" | "createdBy">
  >,
): Partial<ChargeInsert> {
  const dbUpdates: Partial<ChargeInsert> = {};

  if (updates.patientId !== undefined) {
    dbUpdates.psychologist_patient_id = updates.patientId;
  }
  if (updates.sessionId !== undefined) {
    dbUpdates.session_id = updates.sessionId;
  }
  if (updates.priceCents !== undefined) {
    dbUpdates.price_cents = updates.priceCents;
  }
  if (updates.paymentStatus !== undefined) {
    dbUpdates.payment_status = updates.paymentStatus;
  }
  if (updates.paymentMethod !== undefined) {
    dbUpdates.payment_method = updates.paymentMethod;
  }
  if (updates.dueDate !== undefined) {
    dbUpdates.due_date = updates.dueDate;
  }
  if (updates.paidAt !== undefined) {
    dbUpdates.paid_at = updates.paidAt;
  }
  if (updates.description !== undefined) {
    dbUpdates.description = updates.description;
  }
  if (updates.paymentNotes !== undefined) {
    dbUpdates.payment_notes = updates.paymentNotes;
  }
  if (updates.invoiceNumber !== undefined) {
    dbUpdates.invoice_number = updates.invoiceNumber;
  }
  if (updates.invoiceUrl !== undefined) {
    dbUpdates.invoice_url = updates.invoiceUrl;
  }
  if (updates.attachmentUrl !== undefined) {
    dbUpdates.attachment_url = updates.attachmentUrl;
  }
  if (updates.documentStatus !== undefined) {
    dbUpdates.document_status = updates.documentStatus;
  }
  if (updates.lastSentAt !== undefined) {
    dbUpdates.last_sent_at = updates.lastSentAt;
  }
  if (updates.sentCount !== undefined) {
    dbUpdates.sent_count = updates.sentCount;
  }
  if (updates.updatedBy !== undefined) {
    dbUpdates.updated_by = updates.updatedBy;
  }

  return dbUpdates;
}
