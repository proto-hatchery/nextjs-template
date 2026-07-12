"use client";

import { useSearchParams } from "next/navigation";

import { useOnboardingSuccessPage } from "../_hooks/use-onboarding-success-page";
import { ErrorState } from "./error-state";
import { SuccessState } from "./success-state";

export function OnboardingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { status, error } = useOnboardingSuccessPage(sessionId);

  if (error) {
    return <ErrorState error={error} />;
  }

  return <SuccessState status={status} />;
}
