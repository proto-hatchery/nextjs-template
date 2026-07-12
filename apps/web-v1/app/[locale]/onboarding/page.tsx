import { getCurrentOnboardingStepAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { redirect } from "next/navigation";

/**
 * Server component — reads the user's saved onboarding step from the DB and
 * redirects to the correct step URL so returning users resume where they left off.
 */
export default async function OnboardingPage() {
  const stepResult = await getCurrentOnboardingStepAction({});

  if (!stepResult.success) {
    redirect("/onboarding/identity");
  }

  if (stepResult.data.isComplete) {
    redirect("/");
  }

  redirect(`/onboarding/${stepResult.data.stepId}`);
}
