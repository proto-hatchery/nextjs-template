import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getProfileOnboardingDataAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { redirect } from "next/navigation";

import VisualPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function VisualOnboardingPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "visual" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  const dataResult = await getProfileOnboardingDataAction({});

  return (
    <VisualPageClient
      initialData={
        dataResult.success
          ? {
              displayName: dataResult.data.displayName,
              bio: dataResult.data.bio,
              avatarUrl: dataResult.data.avatarUrl,
              ...(dataResult.data.avatarPath ? { avatarPath: dataResult.data.avatarPath } : {}),
            }
          : { displayName: "", bio: "", avatarUrl: "" }
      }
    />
  );
}
