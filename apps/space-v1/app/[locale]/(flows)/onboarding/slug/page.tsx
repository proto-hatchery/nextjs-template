import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getProfileOnboardingDataAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { redirect } from "next/navigation";

import SlugPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function SlugOnboardingPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "slug" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  const dataResult = await getProfileOnboardingDataAction({});

  return <SlugPageClient initialData={{ slug: dataResult.success ? dataResult.data.slug : "" }} />;
}
