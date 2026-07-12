"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { cn } from "@workspace/ui/lib/utils";

interface OnboardingBannerProps {
  completionPercentage: number;
  nextPendingStep: string | null;
  webUrl?: string;
  onboardingHref?: string;
  className?: string;
}

const stepLabels: Record<string, string> = {
  subscription: "plano",
  identity: "dados pessoais",
  professional: "dados profissionais",
  configuration: "serviços e agenda",
  profile: "perfil público",
};

export function OnboardingBanner({
  completionPercentage,
  nextPendingStep,
  webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3010",
  onboardingHref,
  className,
}: OnboardingBannerProps) {
  const onboardingUrl = onboardingHref ?? `${webUrl}/onboarding`;
  const nextStepLabel = nextPendingStep ? stepLabels[nextPendingStep] : "perfil";

  return (
    <div className={cn("w-full border-b bg-background", className)}>
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              Complete seu perfil para aproveitar todos os recursos
            </span>
            <span className="text-xs text-muted-foreground">
              {completionPercentage}% concluído • Falta: {nextStepLabel}
            </span>
          </div>
        </div>
        <Link href={onboardingUrl}>
          <BrandButton
            variant="secondary"
            size="small"
            rightIcon={<ArrowRight className="size-4" />}
          >
            Continuar
          </BrandButton>
        </Link>
      </div>
    </div>
  );
}
