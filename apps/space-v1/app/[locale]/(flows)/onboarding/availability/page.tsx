import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getAvailabilityStepDataAction } from "@workspace/supabase-data/actions/onboarding/steps/availability-step-action";
import { redirect } from "next/navigation";

import AvailabilityPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function AvailabilityOnboardingPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "availability" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  await getAvailabilityStepDataAction({});

  return <AvailabilityPageClient />;
}
