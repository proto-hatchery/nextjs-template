"use client";

import { OnboardingStep } from "@workspace/brand/onboarding";
import { saveProfileSpecialtiesAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Step4Specialties } from "../_components/steps/step-4-specialties";

interface SpecialtiesPageClientProps {
  initialData: {
    specialties: string[];
    therapeuticApproaches: string[];
  };
}

export default function SpecialtiesPageClient({ initialData }: SpecialtiesPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);

  const handleContinue = () => {
    startTransition(async () => {
      const result = await saveProfileSpecialtiesAction(data);

      if (result.success) {
        router.push("/onboarding/education");
        return;
      }

      toast.error(result.error?.message || "Erro ao salvar palavras-chave");
    });
  };

  return (
    <OnboardingStep
      title="Palavras-chave"
      description="Escolha especialidades e abordagens terapêuticas para melhorar sua descoberta."
      onBack={() => router.push("/onboarding/visual")}
      onContinue={handleContinue}
      continueLabel={isPending ? "Salvando..." : "Continuar para formação"}
      continueDisabled={
        data.specialties.length === 0 || data.therapeuticApproaches.length === 0 || isPending
      }
      isPending={isPending}
    >
      <Step4Specialties
        specialties={data.specialties}
        therapeuticApproaches={data.therapeuticApproaches}
        onChange={(updates) => setData((current) => ({ ...current, ...updates }))}
      />
    </OnboardingStep>
  );
}
