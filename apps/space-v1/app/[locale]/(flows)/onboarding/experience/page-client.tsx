"use client";

import { OnboardingStep } from "@workspace/brand/onboarding";
import { saveProfileExperienceAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Step6Experience } from "../_components/steps/step-6-experience";

interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  type: "academic" | "professional";
}

interface ExperiencePageClientProps {
  initialData: {
    professionalTimeline: TimelineItem[];
  };
}

export default function ExperiencePageClient({ initialData }: ExperiencePageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<TimelineItem[]>(initialData.professionalTimeline);

  const handleContinue = () => {
    startTransition(async () => {
      const result = await saveProfileExperienceAction({ professionalTimeline: items });

      if (result.success) {
        router.push("/onboarding/publish");
        return;
      }

      toast.error(result.error?.message || "Erro ao salvar experiência");
    });
  };

  return (
    <OnboardingStep
      title="Experiência profissional"
      description="Mostre sua experiência para fortalecer a confiança no perfil."
      onBack={() => router.push("/onboarding/education")}
      onContinue={handleContinue}
      continueLabel={isPending ? "Salvando..." : "Continuar para publicação"}
      isPending={isPending}
    >
      <Step6Experience items={items} onChange={setItems} />
    </OnboardingStep>
  );
}
