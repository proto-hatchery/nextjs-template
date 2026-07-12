import { ok, err, type Result } from "neverthrow";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FinancialRepository } from "../../domain/ports/financial-repository.port";
import type { FinancialEntryDTO } from "../../domain/dto/financial-entry.dto";
import { AppError, AppErrorCode } from "../../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import { fromDatabaseRow, toDatabaseInsert } from "../mappers/financial.mapper";

export class FinancialSupabaseRepository implements FinancialRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(
    psychologistId: string,
    entry: Omit<FinancialEntryDTO, "id" | "psychologistId" | "createdAt" | "updatedAt" | "status">,
  ): Promise<Result<FinancialEntryDTO, AppError>> {
    try {
      const insertData = toDatabaseInsert(psychologistId, entry);

      const { data, error } = await this.supabase
        .from("psychologist_financial_entries")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to create financial entry", {
            originalError: error,
          }),
        );
      }

      return ok(fromDatabaseRow(data));
    } catch (_error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error creating financial entry"),
      );
    }
  }
}
