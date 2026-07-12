"use client";

import { OnboardingStep } from "@workspace/brand/onboarding";
import { publishProfileAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Step7Publish } from "../_components/steps/step-7-publish";

interface PublishPageClientProps {
  initialData: {
    showInMarketplace: boolean;
    acceptingNewPatients: boolean;
  };
}

export default function PublishPageClient({ initialData }: PublishPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);

  const handleContinue = () => {
    startTransition(async () => {
      const result = await publishProfileAction(data);

      if (result.success) {
        router.push("/");
        return;
      }

      toast.error(result.error?.message || "Erro ao publicar perfil");
    });
  };

  return (
    <OnboardingStep
      title="Publicar perfil"
      description="Escolha como seu perfil ficará visível quando a configuração terminar."
      onBack={() => router.push("/onboarding/experience")}
      onContinue={handleContinue}
      continueLabel={isPending ? "Publicando..." : "Publicar perfil"}
      isPending={isPending}
    >
      <Step7Publish
        showInMarketplace={data.showInMarketplace}
        acceptingNewPatients={data.acceptingNewPatients}
        onChange={(updates) => setData((current) => ({ ...current, ...updates }))}
      />
    </OnboardingStep>
  );
}
