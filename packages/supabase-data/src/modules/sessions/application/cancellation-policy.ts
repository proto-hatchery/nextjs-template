import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  CancellationFeeDTO,
  EffectiveCancellationPolicyDTO,
  PsychologistCancellationPolicyDTO,
} from "../domain/dto/cancellation-policy.dto";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function getCurrentCancellationPolicy(
  supabase: TypedSupabaseClient,
  psychologistId: string,
): Promise<PsychologistCancellationPolicyDTO | null> {
  const { data, error } = await supabase
    .from("psychologist_session_cancellation_policy")
    .select("policy_code, effective_from, effective_until")
    .eq("psychologist_id", psychologistId)
    .is("effective_until", null)
    .order("effective_from", { ascending: false })
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  return {
    policyCode: data.policy_code ?? "standard",
    effectiveFrom: data.effective_from,
    effectiveUntil: data.effective_until,
  };
}

export async function setCancellationPolicy(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  policyCode: string,
): Promise<void> {
  const { error } = await supabase.from("psychologist_session_cancellation_policy").insert({
    psychologist_id: psychologistId,
    policy_code: policyCode as Database["public"]["Enums"]["cancellation_policy_code"],
    effective_from: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

export async function calculateCancellationFee(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  sessionStartTime: string,
  cancellationTime?: string,
): Promise<CancellationFeeDTO | null> {
  const { data, error } = await supabase.rpc("calculate_cancellation_fee", {
    p_psychologist_id: psychologistId,
    p_session_start_time: sessionStartTime,
    p_cancellation_time: cancellationTime ?? new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  const result = data?.[0];
  if (!result) return null;

  return {
    feePercentage: result.fee_percentage,
    minNoticeHours: result.min_notice_hours,
    hoursBeforeSession: Number(result.hours_before_session),
    policyApplies: result.policy_applies,
  };
}

export async function getEffectiveCancellationPolicy(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  referenceTime?: string,
): Promise<EffectiveCancellationPolicyDTO | null> {
  const { data, error } = await supabase.rpc("get_effective_cancellation_policy", {
    p_psychologist_id: psychologistId,
    p_reference_timestamp: referenceTime ?? new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  const result = data?.[0];
  if (!result) return null;

  return {
    policyCode: result.policy_code,
    feePercentage: result.fee_percentage,
    minNoticeHours: result.min_notice_hours,
    effectiveFrom: result.effective_from,
    effectiveUntil: result.effective_until,
  };
}
