import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { redirect } from "next/navigation";

import SubscriptionPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "subscription" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  return <SubscriptionPageClient />;
}
