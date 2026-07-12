import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getIdentityStepDataAction } from "@workspace/supabase-data/actions/onboarding/steps/identity-step-action";
import { redirect } from "next/navigation";

import IdentityPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function IdentityPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "identity" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  const dataResult = await getIdentityStepDataAction({});
  const existingData = dataResult.success ? dataResult.data : {};

  return <IdentityPageClient initialData={existingData} />;
}
