import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getProfileOnboardingDataAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { redirect } from "next/navigation";

import ExperiencePageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function ExperienceOnboardingPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "experience" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  const dataResult = await getProfileOnboardingDataAction({});

  return (
    <ExperiencePageClient
      initialData={
        dataResult.success
          ? { professionalTimeline: dataResult.data.professionalTimeline as never[] }
          : { professionalTimeline: [] }
      }
    />
  );
}
