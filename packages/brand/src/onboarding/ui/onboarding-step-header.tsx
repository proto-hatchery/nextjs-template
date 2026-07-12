"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { cn } from "@workspace/ui/lib/utils";
import { useOnboardingContext } from "./onboarding-context";

interface OnboardingStepHeaderProps {
  title: string;
  description: string;
  className?: string;
  centered?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function OnboardingStepHeader({
  title,
  description,
  className,
  centered = false,
  titleClassName,
  descriptionClassName,
}: OnboardingStepHeaderProps) {
  const { onFinishLater, finishLaterLabel = "Terminar mais tarde" } = useOnboardingContext();

  return (
    <div
      className={cn(
        "mb-6 flex items-start justify-between gap-4",
        centered && "flex-col items-center text-center",
        className,
      )}
    >
      <div className={cn(centered && "flex flex-col items-center")}>
        <h2 className={cn("text-2xl font-bold text-slate-900", titleClassName)}>{title}</h2>
        <p className={cn("text-slate-600 mt-1", descriptionClassName)}>{description}</p>
      </div>

      {onFinishLater && !centered && (
        <BrandButton
          family="rounded"
          variant="ghost"
          size="sm"
          onClick={onFinishLater}
          className="shrink-0 rounded-full text-gray-600 hover:scale-100 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 -mr-2"
        >
          {finishLaterLabel}
        </BrandButton>
      )}
    </div>
  );
}
