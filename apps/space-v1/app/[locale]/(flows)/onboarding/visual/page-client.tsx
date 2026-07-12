"use client";

import { OnboardingStep } from "@workspace/brand/onboarding";
import { saveProfileVisualAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Step3Visual } from "../_components/steps/step-3-visual";

interface VisualPageClientProps {
  initialData: {
    displayName: string;
    bio: string;
    avatarUrl: string;
    avatarPath?: string;
  };
}

export default function VisualPageClient({ initialData }: VisualPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);

  const handleContinue = () => {
    startTransition(async () => {
      const result = await saveProfileVisualAction({
        displayName: data.displayName,
        bio: data.bio,
      });

      if (result.success) {
        router.push("/onboarding/specialties");
        return;
      }

      toast.error(result.error?.message || "Erro ao salvar visual do perfil");
    });
  };

  return (
    <OnboardingStep
      title="Identificação visual"
      description="Defina foto, nome profissional e uma apresentação curta."
      onBack={() => router.push("/onboarding/links")}
      onContinue={handleContinue}
      continueLabel={isPending ? "Salvando..." : "Continuar para palavras-chave"}
      continueDisabled={!data.displayName || isPending}
      isPending={isPending}
    >
      <Step3Visual
        displayName={data.displayName}
        bio={data.bio}
        avatarUrl={data.avatarUrl}
        avatarPath={data.avatarPath}
        onChange={(updates) => setData((current) => ({ ...current, ...updates }))}
      />
    </OnboardingStep>
  );
}
