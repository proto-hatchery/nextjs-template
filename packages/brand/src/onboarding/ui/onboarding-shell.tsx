"use client";

import { OnboardingProvider } from "./onboarding-context";
import { OnboardingSidebar } from "./onboarding-sidebar";
import { type StepGroup } from "../types";

interface OnboardingShellProps {
  children: React.ReactNode;
  groups: StepGroup[];
  allSubSteps: string[];
  currentSubStepId?: string;
  onFinishLater?: () => void;
  finishLaterLabel?: string;
  app?: "space" | "desk" | "admin" | "clinic" | "connect" | "web";
  subtitle?: string;
}

export function OnboardingShell({
  children,
  groups,
  allSubSteps,
  currentSubStepId,
  onFinishLater,
  finishLaterLabel,
  app = "space",
  subtitle,
}: OnboardingShellProps) {
  return (
    <OnboardingProvider
      value={{
        ...(onFinishLater !== undefined ? { onFinishLater } : {}),
        ...(finishLaterLabel !== undefined ? { finishLaterLabel } : {}),
      }}
    >
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 font-sans md:p-8">
        <div className="flex h-[min(760px,calc(100vh-2rem))] max-h-[760px] w-full max-w-6xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl md:h-[min(760px,calc(100vh-4rem))] lg:flex-row">
          <OnboardingSidebar
            groups={groups}
            allSubSteps={allSubSteps}
            {...(currentSubStepId !== undefined ? { currentSubStepId } : {})}
            app={app}
            {...(subtitle !== undefined ? { subtitle } : {})}
          />
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden">{children}</div>
          </div>
        </div>
      </div>
    </OnboardingProvider>
  );
}
