"use client";

import { OnboardingShell } from "@workspace/brand/onboarding";
import { signOut } from "@workspace/supabase-auth/browser/sign-out";
import { usePathname } from "next/navigation";

import { ALL_SUB_STEPS, ONBOARDING_GROUPS } from "../_lib/types";

interface OnboardingLayoutClientProps {
  children: React.ReactNode;
  serverStepId?: string;
  completedSteps?: string[];
  phase?: number;
}

export function OnboardingLayoutClient({ children, serverStepId }: OnboardingLayoutClientProps) {
  const pathname = usePathname();

  // Find current sub-step from pathname
  const currentSubStepId = ALL_SUB_STEPS.find((step) => pathname.includes(step)) ?? serverStepId;

  const handleFinishLater = () => {
    void signOut().then(() => {
      window.location.assign("/login");
    });
  };
  const onboardingShellProps = currentSubStepId ? { currentSubStepId } : {};

  return (
    <OnboardingShell
      groups={ONBOARDING_GROUPS}
      allSubSteps={ALL_SUB_STEPS as string[]}
      {...onboardingShellProps}
      onFinishLater={handleFinishLater}
      app="space"
      subtitle="Configuração de perfil"
    >
      {children}
    </OnboardingShell>
  );
}
