import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getProfessionalStepDataAction } from "@workspace/supabase-data/actions/onboarding/steps/professional-step-action";
import { redirect } from "next/navigation";

import ProfessionalPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function ProfessionalPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "professional" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  const dataResult = await getProfessionalStepDataAction({});
  const existingData = dataResult.success ? dataResult.data : {};

  return <ProfessionalPageClient initialData={existingData} />;
}
