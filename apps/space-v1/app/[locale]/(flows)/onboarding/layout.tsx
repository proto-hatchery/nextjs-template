import { getCurrentOnboardingStepAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { redirect } from "next/navigation";

import { Phase2OnboardingLayoutClient } from "./_components/phase2-onboarding-layout-client";

export const dynamic = "force-dynamic";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default async function Phase2OnboardingLayout({ children }: OnboardingLayoutProps) {
  const stepResult = await getCurrentOnboardingStepAction({});

  if (stepResult.success) {
    if (stepResult.data.phase < 2) {
      const webBase = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3010";
      redirect(`${webBase}/onboarding/identity`);
    }

    if (stepResult.data.isComplete) {
      redirect("/");
    }
  }

  return (
    <div className="flex h-dvh flex-col">
      <Phase2OnboardingLayoutClient
        {...(stepResult.success ? { serverStepId: stepResult.data.stepId } : {})}
      >
        {children}
      </Phase2OnboardingLayoutClient>
    </div>
  );
}
