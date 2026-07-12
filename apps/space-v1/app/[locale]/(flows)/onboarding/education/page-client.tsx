"use client";

import { OnboardingStep } from "@workspace/brand/onboarding";
import { saveProfileEducationAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Step5Education } from "../_components/steps/step-5-education";

interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  type: "academic" | "professional";
}

interface EducationPageClientProps {
  initialData: {
    academicTimeline: TimelineItem[];
  };
}

export default function EducationPageClient({ initialData }: EducationPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<TimelineItem[]>(initialData.academicTimeline);

  const handleContinue = () => {
    startTransition(async () => {
      const result = await saveProfileEducationAction({ academicTimeline: items });

      if (result.success) {
        router.push("/onboarding/experience");
        return;
      }

      toast.error(result.error?.message || "Erro ao salvar formação");
    });
  };

  return (
    <OnboardingStep
      title="Formação"
      description="Adicione sua trajetória acadêmica principal."
      onBack={() => router.push("/onboarding/specialties")}
      onContinue={handleContinue}
      continueLabel={isPending ? "Salvando..." : "Continuar para experiência"}
      isPending={isPending}
    >
      <Step5Education items={items} onChange={setItems} />
    </OnboardingStep>
  );
}
