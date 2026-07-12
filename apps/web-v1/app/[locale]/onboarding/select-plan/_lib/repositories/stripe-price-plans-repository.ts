import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";

export interface StripePricePlanRow {
  subscription_plan_id: string;
  stripe_price_id: string | null;
}

export async function listStripePricePlans() {
  const supabase = createBrowserAuthClient();

  const { data, error } = await supabase
    .from("subscription_plans")
    .select("subscription_plan_id, stripe_price_id")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as StripePricePlanRow[];
}
