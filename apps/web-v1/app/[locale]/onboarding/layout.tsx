import { getCurrentOnboardingStepAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { redirect } from "next/navigation";

import { OnboardingLayoutClient } from "./_components/onboarding-layout-client";

/** Onboarding uses cookies and Supabase server-side (resume URL, draft, auth). Must not be prerendered at build. */
export const dynamic = "force-dynamic";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const stepResult = await getCurrentOnboardingStepAction({});

  if (stepResult.success && stepResult.data.isComplete) {
    redirect("/");
  }

  return (
    <div className="flex h-dvh flex-col">
      <OnboardingLayoutClient
        {...(stepResult.success ? { serverStepId: stepResult.data.stepId } : {})}
        {...(stepResult.success ? { completedSteps: stepResult.data.completedSteps } : {})}
        {...(stepResult.success ? { phase: stepResult.data.phase } : {})}
      >
        {children}
      </OnboardingLayoutClient>
    </div>
  );
}
