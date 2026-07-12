import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { getPhoneVerificationStepDataAction } from "@workspace/supabase-data/actions/onboarding/steps/phone-verification-step-action";
import { redirect } from "next/navigation";

import PhoneVerificationPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function PhoneVerificationPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "phone-verification" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  const dataResult = await getPhoneVerificationStepDataAction({});
  const existingData = dataResult.success ? dataResult.data : {};

  return existingData.phone ? (
    <PhoneVerificationPageClient initialPhone={existingData.phone} />
  ) : (
    <PhoneVerificationPageClient />
  );
}
