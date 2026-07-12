import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getServicesStepDataAction } from "@workspace/supabase-data/actions/onboarding/steps/services-step-action";
import { redirect } from "next/navigation";

import ServicesStepClient from "./_components/services-step-client";

export const dynamic = "force-dynamic";

export default async function ServicesOnboardingPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "services" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  const dataResult = await getServicesStepDataAction({});

  return (
    <ServicesStepClient initialData={dataResult.success ? dataResult.data : { services: [] }} />
  );
}
