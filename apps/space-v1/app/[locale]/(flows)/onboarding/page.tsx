import { getCurrentOnboardingStepAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SpacePhase2OnboardingPage() {
  const result = await getCurrentOnboardingStepAction({});

  if (result.success) {
    if (result.data.phase < 2) {
      const webBase = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3010";
      redirect(`${webBase}/onboarding/identity`);
    }

    if (result.data.isComplete) {
      redirect("/");
    }

    redirect(`/onboarding/${result.data.stepId}`);
  }

  redirect("/onboarding/services");
}
