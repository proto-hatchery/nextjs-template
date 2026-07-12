import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import { getNegotiatedPrice } from "../../finances/application/financial-entry-queries";

type TypedSupabaseClient = SupabaseClient<Database>;

export interface PricingPlanDTO {
  readonly subscriptionPlanId: string;
  readonly planName: string;
  readonly stripePriceId: string;
  readonly features: unknown;
}

export async function listPricingPlans(
  supabase: TypedSupabaseClient,
): Promise<readonly PricingPlanDTO[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("subscription_plan_id, plan_name, stripe_price_id, features")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).flatMap((plan) => {
    if (
      typeof plan.subscription_plan_id !== "string" ||
      typeof plan.plan_name !== "string" ||
      typeof plan.stripe_price_id !== "string"
    ) {
      return [];
    }

    return [
      {
        subscriptionPlanId: plan.subscription_plan_id,
        planName: plan.plan_name,
        stripePriceId: plan.stripe_price_id,
        features: plan.features,
      },
    ];
  });
}

export async function getNegotiatedSessionPrice(
  supabase: TypedSupabaseClient,
  patientId: string,
  serviceId: string,
): Promise<number | null> {
  return getNegotiatedPrice(supabase, patientId, serviceId);
}
