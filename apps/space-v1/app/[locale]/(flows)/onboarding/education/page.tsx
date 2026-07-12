import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getProfileOnboardingDataAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { redirect } from "next/navigation";

import EducationPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function EducationOnboardingPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "education" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  const dataResult = await getProfileOnboardingDataAction({});

  return (
    <EducationPageClient
      initialData={
        dataResult.success
          ? { academicTimeline: dataResult.data.academicTimeline as never[] }
          : { academicTimeline: [] }
      }
    />
  );
}
