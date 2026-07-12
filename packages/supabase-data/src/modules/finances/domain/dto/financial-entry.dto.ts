/**
 * Domain DTOs for finances module
 */

export type FinancialEntryType = "income" | "expense";

export interface FinancialEntryDTO {
  readonly id: string;
  readonly psychologistId: string;
  readonly type: FinancialEntryType;
  readonly amount: number;
  readonly description: string | null;
  readonly dateTime: string;
  readonly categoryId: string | null;
  readonly sessionId: string | null;
  readonly paymentMethod: string | null;
  readonly notes: string | null;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
}
