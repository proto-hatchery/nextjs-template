"use client";

import { Suspense } from "react";

import { OnboardingSuccessContent } from "./_components/onboarding-success-content";
import { SuccessState } from "./_components/success-state";

export default function OnboardingSuccessPage() {
  return (
    <Suspense fallback={<SuccessState status="processing" />}>
      <OnboardingSuccessContent />
    </Suspense>
  );
}
