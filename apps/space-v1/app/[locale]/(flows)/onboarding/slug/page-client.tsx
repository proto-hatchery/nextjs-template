"use client";

import { OnboardingStep } from "@workspace/brand/onboarding";
import { saveProfileSlugAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Step1Slug } from "../_components/steps/step-1-slug";

interface SlugPageClientProps {
  initialData: {
    slug: string;
  };
}

export default function SlugPageClient({ initialData }: SlugPageClientProps) {
  const router = useRouter();
  const [slug, setSlug] = useState(initialData.slug);
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    startTransition(async () => {
      const result = await saveProfileSlugAction({ slug });

      if (result.success) {
        router.push("/onboarding/links");
        return;
      }

      toast.error(result.error?.message || "Erro ao salvar a URL");
    });
  };

  return (
    <OnboardingStep
      title="Escolha sua URL"
      description="Essa será a URL pública do seu perfil profissional."
      onBack={() => router.push("/onboarding/availability")}
      onContinue={handleContinue}
      continueLabel={isPending ? "Salvando..." : "Continuar para links"}
      continueDisabled={!slug || isPending}
      isPending={isPending}
    >
      <Step1Slug slug={slug} onChange={setSlug} />
    </OnboardingStep>
  );
}
