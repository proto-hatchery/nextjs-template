"use client";

import { OnboardingStep } from "@workspace/brand/onboarding";
import { saveAvailabilityStepAction } from "@workspace/supabase-data/actions/onboarding/steps/availability-step-action";
import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { toast } from "sonner";

import {
  AvailabilitySection,
  type AvailabilitySectionRef,
} from "@/app/[locale]/(workspace)/(settings)/preferences/_components/sections/AvailabilitySection";

export default function AvailabilityPageClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const availabilityRef = useRef<AvailabilitySectionRef>(null);

  const handleContinue = () => {
    startTransition(async () => {
      await availabilityRef.current?.save();
      const result = await saveAvailabilityStepAction({});

      if (result.success) {
        router.push("/onboarding/slug");
        return;
      }

      toast.error(result.error?.message || "Erro ao salvar disponibilidade");
    });
  };

  return (
    <OnboardingStep
      title="Configure sua disponibilidade"
      description="Defina seus horários de atendimento para liberar o restante do perfil."
      maxWidthClassName="max-w-5xl"
      onBack={() => router.push("/onboarding/locations")}
      onContinue={handleContinue}
      continueLabel={isPending ? "Salvando..." : "Continuar para URL"}
      isPending={isPending}
    >
      <AvailabilitySection ref={availabilityRef} isOnboarding={true} />
    </OnboardingStep>
  );
}
