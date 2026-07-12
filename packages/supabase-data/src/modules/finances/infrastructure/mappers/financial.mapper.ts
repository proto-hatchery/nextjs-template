import type { FinancialEntryDTO } from "../../domain/dto/financial-entry.dto";
import type { Database } from "@workspace/supabase-infra/types/database";

type FinancialEntryRow = Database["public"]["Tables"]["psychologist_financial_entries"]["Row"];
type FinancialEntryInsert =
  Database["public"]["Tables"]["psychologist_financial_entries"]["Insert"];
type FinancialPaymentMethod = NonNullable<FinancialEntryInsert["payment_method"]>;

const FINANCIAL_PAYMENT_METHODS = new Set<FinancialPaymentMethod>([
  "other",
  "fluripay",
  "card",
  "cash",
  "pix",
  "bank_transfer",
]);

export function fromDatabaseRow(row: FinancialEntryRow): FinancialEntryDTO {
  return {
    id: row.id,
    psychologistId: row.psychologist_id,
    type: row.type as "income" | "expense",
    amount: row.amount,
    description: row.description,
    dateTime: row.date_time ?? new Date().toISOString(),
    categoryId: row.transaction_category_id,
    sessionId: row.session_id,
    paymentMethod: row.payment_method,
    notes: null,
    status: row.status ?? "confirmed",
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at,
  };
}

export function toDatabaseInsert(
  psychologistId: string,
  dto: Omit<FinancialEntryDTO, "id" | "psychologistId" | "createdAt" | "updatedAt" | "status">,
): FinancialEntryInsert {
  const paymentMethod =
    dto.paymentMethod && FINANCIAL_PAYMENT_METHODS.has(dto.paymentMethod as FinancialPaymentMethod)
      ? (dto.paymentMethod as FinancialPaymentMethod)
      : null;

  return {
    psychologist_id: psychologistId,
    type: dto.type,
    amount: dto.amount,
    description: dto.description,
    date_time: dto.dateTime,
    transaction_category_id: dto.categoryId,
    session_id: dto.sessionId,
    payment_method: paymentMethod,
    status: "confirmed",
    created_by: psychologistId,
  };
}
