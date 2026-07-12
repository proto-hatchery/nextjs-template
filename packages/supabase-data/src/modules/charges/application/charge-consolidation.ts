import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import { safeLogger } from "../../../utils/safe-logger";

type TypedSupabaseClient = SupabaseClient<Database>;
type AnyFunction = (...args: unknown[]) => unknown;

interface ConsolidationResult {
  action: "CREATED" | "UPDATED" | "DELETED";
  entry_id: string;
  entry_date: string;
  amount_cents: number;
}

export async function consolidateDailyCharges(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  sessionDate: Date,
): Promise<{ success: boolean; error?: string }> {
  try {
    const dateStr = sessionDate.toISOString().split("T")[0];

    const { data, error } = (await (supabase.rpc as AnyFunction)("consolidate_daily_charges", {
      p_psychologist_id: psychologistId,
      p_date: dateStr,
    })) as { data: unknown; error: { message: string } | null };

    if (error) {
      safeLogger.error("[consolidateDailyCharges] RPC error:", error);
      return { success: false, error: error.message };
    }

    const results = (data as ConsolidationResult[] | null) ?? null;
    if (results && results.length > 0) {
      safeLogger.log(
        "[consolidateDailyCharges] Results:",
        results.map((result) => `${result.action}: ${result.entry_date} = ${result.amount_cents}`),
      );
    }

    return { success: true };
  } catch (error) {
    safeLogger.error("[consolidateDailyCharges] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao consolidar",
    };
  }
}

export async function recalculateDailyConsolidationForCharge(
  supabase: TypedSupabaseClient,
  chargeId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = (await (supabase.rpc as AnyFunction)(
      "recalculate_daily_consolidation_for_charge",
      { p_charge_id: chargeId },
    )) as { error: { message: string } | null };

    if (error) {
      safeLogger.error("[recalculateDailyConsolidationForCharge] RPC error:", error);
      return { success: false, error: error.message };
    }

    safeLogger.log(
      "[recalculateDailyConsolidationForCharge] Recalculation completed for charge:",
      chargeId,
    );
    return { success: true };
  } catch (error) {
    safeLogger.error("[recalculateDailyConsolidationForCharge] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao recalcular",
    };
  }
}
