import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getLocationsStepDataAction } from "@workspace/supabase-data/actions/onboarding/steps/locations-step-action";
import { redirect } from "next/navigation";

import LocationsPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function LocationsOnboardingPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "locations" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  const dataResult = await getLocationsStepDataAction({});

  return (
    <LocationsPageClient
      initialData={dataResult.success ? dataResult.data : { locations: [], onlineOnly: false }}
    />
  );
}
