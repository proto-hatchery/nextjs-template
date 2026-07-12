import { err, ok, type Result } from "neverthrow";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  ChargeResult,
  CreateChargeInput,
  MutationResult,
  PaymentMethod,
  PaymentStatus,
} from "@workspace/supabase-data/types/entities";
import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
} from "../../../lib/errors/app-error";
import {
  createChargeSchema,
  updateChargeMethodSchema,
  updateChargeStatusSchema,
  updateChargeValueSchema,
} from "../../../utils/validation-schemas";
import { recalculateDailyConsolidationForCharge } from "./charge-consolidation";

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

function notFound(message: string, resourceType: string, resourceId?: string): AppErrorType {
  return AppError.notFound(AppErrorCode.NOT_FOUND_RESOURCE, message, resourceType, resourceId);
}

export async function createChargeForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: CreateChargeInput,
): Promise<Result<ChargeResult, AppErrorType>> {
  const parsed = createChargeSchema.safeParse(input);
  if (!parsed.success) {
    return err(validationError(parsed.error.issues[0]?.message ?? "Dados inválidos"));
  }

  return err(
    validationError(
      "A criação manual de cobranças foi desativada. As cobranças são geradas automaticamente pelas sessões faturáveis.",
    ),
  );
}

export async function updateChargeStatusForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  chargeId: string,
  status: PaymentStatus,
): Promise<Result<MutationResult, AppErrorType>> {
  if (!chargeId) {
    return err(validationError("ID da cobrança inválido"));
  }

  const parsed = updateChargeStatusSchema.safeParse({ status });
  if (!parsed.success) {
    return err(validationError(parsed.error.issues[0]?.message ?? "Status inválido"));
  }

  const { data: currentCharge, error: fetchError } = await supabase
    .from("psychologist_patient_charges")
    .select("payment_status, paid_at, session_id")
    .eq("id", chargeId)
    .eq("psychologist_id", psychologistId)
    .single();

  if (fetchError || !currentCharge) {
    return err(notFound("Cobrança não encontrada", "charge", chargeId));
  }

  const updateData: Database["public"]["Tables"]["psychologist_patient_charges"]["Update"] = {
    payment_status: status,
    updated_at: new Date().toISOString(),
    updated_by: psychologistId,
  };

  if (status === "paid") {
    updateData.paid_at = new Date().toISOString();
  } else if (currentCharge.payment_status === "paid") {
    updateData.paid_at = null;
  }

  const { error } = await supabase
    .from("psychologist_patient_charges")
    .update(updateData)
    .eq("id", chargeId)
    .eq("psychologist_id", psychologistId);

  if (error) {
    return err(
      infraError("Erro ao atualizar status da cobrança", error, { originalError: error.message }),
    );
  }

  if (status === "cancelled" && currentCharge.session_id) {
    const now = new Date().toISOString();

    const { error: sessionError } = await supabase
      .from("calendar_events")
      .update({
        billing_status: "canceled",
        billing_next_attempt_at: null,
        billing_last_error: null,
        updated_at: now,
        updated_by: psychologistId,
      })
      .eq("id", currentCharge.session_id)
      .eq("psychologist_id", psychologistId)
      .eq("event_type", "session");

    if (sessionError) {
      return err(
        infraError(
          "Status atualizado, mas falhou ao suspender o billing automático da sessão",
          sessionError,
        ),
      );
    }
  }

  if (status === "paid" || currentCharge.payment_status === "paid") {
    const consolidationResult = await recalculateDailyConsolidationForCharge(supabase, chargeId);
    if (!consolidationResult.success) {
      return err(
        infraError(
          `Status atualizado, mas houve erro ao consolidar receitas: ${consolidationResult.error}`,
        ),
      );
    }
  }

  return ok({ success: true });
}

export async function updateChargeMethodForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  chargeId: string,
  method: PaymentMethod,
): Promise<Result<MutationResult, AppErrorType>> {
  if (!chargeId) {
    return err(validationError("ID da cobrança inválido"));
  }

  const parsed = updateChargeMethodSchema.safeParse({ paymentMethod: method });
  if (!parsed.success) {
    return err(validationError(parsed.error.issues[0]?.message ?? "Meio de pagamento inválido"));
  }

  const { error } = await supabase
    .from("psychologist_patient_charges")
    .update({
      payment_method: method,
      updated_at: new Date().toISOString(),
      updated_by: psychologistId,
    })
    .eq("id", chargeId)
    .eq("psychologist_id", psychologistId);

  if (error) {
    return err(
      infraError("Erro ao atualizar método de pagamento", error, { originalError: error.message }),
    );
  }

  return ok({ success: true });
}

export async function updateChargeValueForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  chargeId: string,
  value: number,
): Promise<Result<MutationResult, AppErrorType>> {
  if (!chargeId) {
    return err(validationError("ID da cobrança inválido"));
  }

  const parsed = updateChargeValueSchema.safeParse({ priceCents: value });
  if (!parsed.success) {
    return err(validationError(parsed.error.issues[0]?.message ?? "Valor inválido"));
  }

  return err(
    validationError(
      "O valor da cobrança segue o snapshot da sessão. Altere o preço da sessão para refletir novos valores.",
    ),
  );
}

export async function deleteChargeForPsychologist(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  chargeId: string,
): Promise<Result<MutationResult, AppErrorType>> {
  if (!chargeId) {
    return err(validationError("ID da cobrança inválido"));
  }

  const { data: currentCharge, error: fetchError } = await supabase
    .from("psychologist_patient_charges")
    .select("payment_status, session_id")
    .eq("id", chargeId)
    .eq("psychologist_id", psychologistId)
    .single();

  if (fetchError || !currentCharge) {
    return err(notFound("Cobrança não encontrada", "charge", chargeId));
  }

  if (currentCharge.payment_status === "paid" || currentCharge.payment_status === "refunded") {
    return err(
      validationError("Cobranças pagas ou reembolsadas não podem ser invalidadas manualmente."),
    );
  }

  const { error } = await supabase
    .from("psychologist_patient_charges")
    .update({
      payment_status: "cancelled",
      paid_at: null,
      updated_at: new Date().toISOString(),
      updated_by: psychologistId,
    })
    .eq("id", chargeId)
    .eq("psychologist_id", psychologistId);

  if (error) {
    return err(infraError("Erro ao invalidar cobrança", error, { originalError: error.message }));
  }

  if (currentCharge.session_id) {
    const now = new Date().toISOString();

    const { error: sessionError } = await supabase
      .from("calendar_events")
      .update({
        billing_status: "canceled",
        billing_next_attempt_at: null,
        billing_last_error: null,
        updated_at: now,
        updated_by: psychologistId,
      })
      .eq("id", currentCharge.session_id)
      .eq("psychologist_id", psychologistId)
      .eq("event_type", "session");

    if (sessionError) {
      return err(
        infraError(
          "Cobrança invalidada, mas falhou ao suspender o billing da sessão",
          sessionError,
        ),
      );
    }
  }

  return ok({ success: true });
}
