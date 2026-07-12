import { err, ok, type Result } from "neverthrow";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  CreateFinancialEntryInput,
  FinancialEntryResult,
  MutationResult,
  UpdateFinancialEntryInput,
} from "@workspace/supabase-data/types/entities";
import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
} from "../../../lib/errors/app-error";
import { FinancialSupabaseRepository } from "../infrastructure/repositories/financial-supabase.repository";

type TypedSupabaseClient = SupabaseClient<Database>;

function validationError(message: string, details?: Record<string, unknown>): AppErrorType {
  return AppError.validation(AppErrorCode.VALIDATION_INVALID_INPUT, message, details);
}

function infraError(
  message: string,
  cause?: unknown,
  details?: Record<string, unknown>,
): AppErrorType {
  return AppError.infra(AppErrorCode.INFRA_SUPABASE, message, cause, details);
}

function notFound(message: string, resourceId?: string): AppErrorType {
  return AppError.notFound(AppErrorCode.NOT_FOUND_RESOURCE, message, "financial_entry", resourceId);
}

async function validateCategory(
  supabase: TypedSupabaseClient,
  categoryId: string,
  type: "income" | "expense",
): Promise<Result<void, AppErrorType>> {
  const { data: category, error } = await supabase
    .from("reference_values")
    .select("id, metadata")
    .eq("category", "financial_transaction_category")
    .eq("id", categoryId)
    .single();

  if (error || !category) {
    return err(notFound("Categoria não encontrada", categoryId));
  }

  const metadata = category.metadata as Record<string, unknown> | null;
  const categoryType = (metadata?.type as string | undefined)?.toUpperCase();
  if (categoryType !== type.toUpperCase()) {
    return err(
      validationError("Categoria incompatível com o tipo de lançamento", {
        categoryId,
        expectedType: type,
        actualType: categoryType,
      }),
    );
  }

  return ok(undefined);
}

export async function createFinancialEntryForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: CreateFinancialEntryInput,
): Promise<Result<FinancialEntryResult, AppErrorType>> {
  if (input.amount <= 0) {
    return err(validationError("O valor deve ser maior que zero"));
  }

  if (input.dateTime) {
    const inputDate = new Date(input.dateTime);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateToCheck = new Date(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate(),
    );

    if (dateToCheck > today) {
      return err(validationError("A data não pode ser futura"));
    }
  }

  if (input.categoryId) {
    const categoryResult = await validateCategory(supabase, input.categoryId, input.type);
    if (categoryResult.isErr()) {
      return err(categoryResult.error);
    }
  }

  const repository = new FinancialSupabaseRepository(supabase);
  const result = await repository.create(psychologistId, {
    type: input.type,
    amount: input.amount,
    description: input.description ?? null,
    dateTime: input.dateTime ?? new Date().toISOString(),
    categoryId: input.categoryId ?? null,
    sessionId: input.sessionId ?? null,
    paymentMethod: input.paymentMethod ?? null,
    notes: input.notes ?? null,
  });

  if (result.isErr()) {
    return err(result.error);
  }

  return ok({ id: result.value.id });
}

export async function updateFinancialEntryForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  entryId: string,
  input: UpdateFinancialEntryInput,
): Promise<Result<MutationResult, AppErrorType>> {
  if (input.amount !== undefined && input.amount <= 0) {
    return err(validationError("O valor deve ser maior que zero"));
  }

  if (input.dateTime) {
    const inputDate = new Date(input.dateTime);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateToCheck = new Date(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate(),
    );

    if (dateToCheck > today) {
      return err(validationError("A data não pode ser futura"));
    }
  }

  if (input.categoryId) {
    const { data: entry, error: entryError } = await supabase
      .from("psychologist_financial_entries")
      .select("type")
      .eq("id", entryId)
      .eq("psychologist_id", psychologistId)
      .single();

    if (entryError || !entry) {
      return err(notFound("Lançamento não encontrado", entryId));
    }

    const categoryResult = await validateCategory(
      supabase,
      input.categoryId,
      entry.type as "income" | "expense",
    );
    if (categoryResult.isErr()) {
      return err(categoryResult.error);
    }
  }

  const updateData: Database["public"]["Tables"]["psychologist_financial_entries"]["Update"] = {
    updated_at: new Date().toISOString(),
    updated_by: psychologistId,
  };

  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.dateTime !== undefined) updateData.date_time = input.dateTime;
  if (input.categoryId !== undefined) updateData.transaction_category_id = input.categoryId;
  if (input.paymentMethod !== undefined) updateData.payment_method = input.paymentMethod;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.notes !== undefined) updateData.notes = input.notes;

  const { error } = await supabase
    .from("psychologist_financial_entries")
    .update(updateData)
    .eq("id", entryId)
    .eq("psychologist_id", psychologistId);

  if (error) {
    return err(
      infraError("Failed to update financial entry", error, { originalError: error.message }),
    );
  }

  return ok({ success: true });
}

export async function deleteFinancialEntryForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  entryId: string,
): Promise<Result<MutationResult, AppErrorType>> {
  const { data: entry, error: fetchError } = await supabase
    .from("psychologist_financial_entries")
    .select("id, description")
    .eq("id", entryId)
    .eq("psychologist_id", psychologistId)
    .single();

  if (fetchError || !entry) {
    return err(notFound("Lançamento não encontrado", entryId));
  }

  if (entry.description?.startsWith("Serviços Prestados")) {
    return err(
      validationError(
        "Esta entrada é gerada automaticamente a partir de cobranças pagas e não pode ser excluída.",
      ),
    );
  }

  const { error } = await supabase
    .from("psychologist_financial_entries")
    .delete()
    .eq("id", entryId)
    .eq("psychologist_id", psychologistId);

  if (error) {
    return err(
      infraError("Failed to delete financial entry", error, { originalError: error.message }),
    );
  }

  return ok({ success: true });
}
