"use client";

import { createContext, useContext } from "react";

interface OnboardingContextType {
  onFinishLater?: () => void;
  finishLaterLabel?: string;
}

const OnboardingContext = createContext<OnboardingContextType>({});

export function OnboardingProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: OnboardingContextType;
}) {
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboardingContext() {
  return useContext(OnboardingContext);
}
