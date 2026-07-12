import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type { FinancialEntryDTO } from "../dto/financial-entry.dto";

export interface FinancialRepository {
  create(
    psychologistId: string,
    entry: Omit<FinancialEntryDTO, "id" | "psychologistId" | "createdAt" | "updatedAt" | "status">,
  ): Promise<Result<FinancialEntryDTO, AppError>>;
}
