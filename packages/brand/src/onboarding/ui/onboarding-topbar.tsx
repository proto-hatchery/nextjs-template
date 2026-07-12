"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";

interface OnboardingTopbarProps {
  onFinishLater?: () => void;
  finishLaterLabel?: string;
}

export function OnboardingTopbar({
  onFinishLater,
  finishLaterLabel = "Terminar mais tarde",
}: OnboardingTopbarProps) {
  return (
    <header className="flex shrink-0 items-center justify-end p-6">
      <BrandButton
        family="rounded"
        variant="ghost"
        size="sm"
        onClick={onFinishLater}
        className="rounded-full text-gray-600 hover:scale-100 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        {finishLaterLabel}
      </BrandButton>
    </header>
  );
}
