import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getProfileOnboardingDataAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { redirect } from "next/navigation";

import SpecialtiesPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function SpecialtiesOnboardingPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "specialties" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  const dataResult = await getProfileOnboardingDataAction({});

  return (
    <SpecialtiesPageClient
      initialData={
        dataResult.success
          ? {
              specialties: dataResult.data.specialties,
              therapeuticApproaches: dataResult.data.therapeuticApproaches,
            }
          : { specialties: [], therapeuticApproaches: [] }
      }
    />
  );
}
