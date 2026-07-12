import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getProfileOnboardingDataAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { redirect } from "next/navigation";

import PublishPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function PublishOnboardingPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "publish" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  const dataResult = await getProfileOnboardingDataAction({});

  return (
    <PublishPageClient
      initialData={
        dataResult.success
          ? {
              showInMarketplace: dataResult.data.showInMarketplace,
              acceptingNewPatients: dataResult.data.acceptingNewPatients,
            }
          : { showInMarketplace: false, acceptingNewPatients: false }
      }
    />
  );
}
