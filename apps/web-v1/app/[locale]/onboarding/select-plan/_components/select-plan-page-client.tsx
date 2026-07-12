"use client";

import { useRouter } from "next/navigation";

import { useSelectPlan } from "../_lib/use-cases/use-select-plan";
import { SelectPlanView } from "./select-plan-view";

export function SelectPlanPageClient() {
  const router = useRouter();
  const {
    loading,
    isCheckingOut,
    availablePlans,
    selectedPlanId,
    setSelectedPlanId,
    continueWithSelectedPlan,
  } = useSelectPlan(() => {
    router.push("/onboarding/success");
  });

  return (
    <SelectPlanView
      loading={loading}
      plans={availablePlans}
      selectedPlanId={selectedPlanId}
      isCheckingOut={isCheckingOut}
      onSelectPlan={setSelectedPlanId}
      onContinue={() => {
        void continueWithSelectedPlan();
      }}
      onSkip={() => {
        router.push("/onboarding/success");
      }}
    />
  );
}
