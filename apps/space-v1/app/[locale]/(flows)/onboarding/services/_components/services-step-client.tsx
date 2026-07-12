"use client";

import { OnboardingStep } from "@workspace/brand/onboarding";
import { saveServicesStepAction } from "@workspace/supabase-data/actions/onboarding/steps/services-step-action";
import { usePsychologistServices } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { ServicesSection } from "@/app/[locale]/(workspace)/(settings)/preferences/_components/sections/service-section/ServicesSection";

interface ServicesStepClientProps {
  initialData: { services: unknown[] };
}

export default function ServicesStepClient({ initialData: _initialData }: ServicesStepClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { data: services } = usePsychologistServices();

  const hasServices = (services?.length ?? 0) > 0;

  const handleContinue = () => {
    if (!hasServices) {
      toast.error("Adicione pelo menos um serviço para continuar");
      return;
    }

    startTransition(async () => {
      const result = await saveServicesStepAction({
        services: (services ?? []).map((service) => ({
          id: service.id,
          serviceTypeId: service.reference?.id ?? service.catalog_id ?? service.service_id ?? "",
          name: service.reference?.name ?? service.name,
          durationMinutes: Number(service.duration_minutes ?? 50),
          priceInCents: Number(service.price ?? 0),
          isActive: service.is_active,
        })),
      });

      if (result.success) {
        router.push("/onboarding/locations");
        return;
      }

      toast.error(result.error?.message || "Erro ao salvar serviços");
    });
  };

  return (
    <OnboardingStep
      title="Configure seus serviços"
      description="Adicione pelo menos um tipo de atendimento para continuar."
      maxWidthClassName="max-w-5xl"
      onContinue={handleContinue}
      continueLabel={isPending ? "Salvando..." : "Continuar para locais"}
      continueDisabled={!hasServices || isPending}
      isPending={isPending}
    >
      <ServicesSection isOnboarding={true} />
    </OnboardingStep>
  );
}
