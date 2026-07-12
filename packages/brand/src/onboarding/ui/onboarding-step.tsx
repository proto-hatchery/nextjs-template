"use client";

import { OnboardingStepActions } from "./onboarding-step-actions";
import { OnboardingStepContainer } from "./onboarding-step-container";
import { OnboardingStepHeader } from "./onboarding-step-header";

interface OnboardingStepProps {
  children: React.ReactNode;
  title: string;
  description: string;
  maxWidthClassName?: string;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel: string;
  backLabel?: string;
  isPending?: boolean;
  continuePendingLabel?: string;
  /** Disables the continue button without showing a loading spinner */
  continueDisabled?: boolean;
}

export function OnboardingStep({
  children,
  title,
  description,
  maxWidthClassName = "max-w-5xl",
  onBack,
  onContinue,
  continueLabel,
  backLabel = "Voltar",
  isPending,
  continuePendingLabel,
  continueDisabled,
}: OnboardingStepProps) {
  return (
    <OnboardingStepContainer maxWidthClassName={maxWidthClassName} className="py-2 sm:py-8">
      <div className="shrink-0">
        <OnboardingStepHeader title={title} description={description} />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 -mx-2 px-2 pt-[3px] -mt-[3px] pb-4 flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>

      <div className="shrink-0 mt-auto pt-6 bg-white/80 backdrop-blur-sm sticky bottom-0">
        <OnboardingStepActions
          {...(onBack !== undefined ? { onBack } : {})}
          onContinue={onContinue}
          continueLabel={continueLabel}
          backLabel={backLabel}
          {...(isPending !== undefined ? { isPending } : {})}
          {...(continuePendingLabel !== undefined ? { continuePendingLabel } : {})}
          {...(continueDisabled !== undefined ? { continueDisabled } : {})}
        />
      </div>
    </OnboardingStepContainer>
  );
}
