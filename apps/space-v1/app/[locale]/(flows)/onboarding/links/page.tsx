import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getProfileOnboardingDataAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { redirect } from "next/navigation";

import LinksPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function LinksOnboardingPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "links" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  const dataResult = await getProfileOnboardingDataAction({});

  return (
    <LinksPageClient
      initialData={
        dataResult.success
          ? {
              slug: dataResult.data.slug,
              ...(dataResult.data.phone ? { phone: dataResult.data.phone } : {}),
              links: dataResult.data.links,
            }
          : { slug: "", links: [] }
      }
    />
  );
}
