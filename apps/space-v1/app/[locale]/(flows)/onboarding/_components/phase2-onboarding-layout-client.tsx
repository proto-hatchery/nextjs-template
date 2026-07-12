"use client";

import { OnboardingShell } from "@workspace/brand/onboarding";
import { signOut } from "@workspace/supabase-auth/browser/sign-out";
import { usePathname } from "next/navigation";

import { ALL_PHASE2_SUB_STEPS, PHASE2_ONBOARDING_GROUPS } from "../_lib/types";

interface Phase2OnboardingLayoutClientProps {
  children: React.ReactNode;
  serverStepId?: string;
}

export function Phase2OnboardingLayoutClient({
  children,
  serverStepId,
}: Phase2OnboardingLayoutClientProps) {
  const pathname = usePathname();

  const currentSubStepId =
    ALL_PHASE2_SUB_STEPS.find((step) => pathname.includes(`/${step}`)) ?? serverStepId;

  const handleFinishLater = () => {
    void signOut().then(() => {
      window.location.assign("/login");
    });
  };

  return (
    <OnboardingShell
      groups={PHASE2_ONBOARDING_GROUPS}
      allSubSteps={ALL_PHASE2_SUB_STEPS}
      {...(currentSubStepId ? { currentSubStepId } : {})}
      onFinishLater={handleFinishLater}
      app="space"
      subtitle="Configuração de perfil"
    >
      {children}
    </OnboardingShell>
  );
}
