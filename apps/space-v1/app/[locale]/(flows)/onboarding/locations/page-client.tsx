"use client";

import { OnboardingStep } from "@workspace/brand/onboarding";
import { saveLocationsStepAction } from "@workspace/supabase-data/actions/onboarding/steps/locations-step-action";
import { usePsychologistLocations } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { LocationsSection } from "@/app/[locale]/(workspace)/(settings)/preferences/_components/sections/service-section/LocationsSection";

interface LocationsPageClientProps {
  initialData: {
    locations: unknown[];
    onlineOnly: boolean;
  };
}

export default function LocationsPageClient({ initialData }: LocationsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [onlineOnly, setOnlineOnly] = useState(initialData.onlineOnly);
  const { data: locations } = usePsychologistLocations();

  const hasLocations = (locations?.length ?? 0) > 0;

  const handleContinue = () => {
    if (!hasLocations && !onlineOnly) {
      toast.error("Adicione um local ou selecione atendimento apenas online");
      return;
    }

    startTransition(async () => {
      const result = await saveLocationsStepAction({
        locations: (locations ?? []).map((location) => ({
          id: location.id,
          name: location.name ?? "",
          address: [location.street, location.number, location.city, location.state]
            .filter(Boolean)
            .join(", "),
          isOnline: false,
          isActive: location.is_active ?? true,
        })),
        onlineOnly,
      });

      if (result.success) {
        router.push("/onboarding/availability");
        return;
      }

      toast.error(result.error?.message || "Erro ao salvar locais");
    });
  };

  return (
    <OnboardingStep
      title="Defina seus locais"
      description="Cadastre onde você atende ou informe que atende apenas online."
      maxWidthClassName="max-w-5xl"
      onBack={() => router.push("/onboarding/services")}
      onContinue={handleContinue}
      continueLabel={isPending ? "Salvando..." : "Continuar para horários"}
      continueDisabled={(!hasLocations && !onlineOnly) || isPending}
      isPending={isPending}
    >
      <LocationsSection isOnboarding={true} onOnlineOnlyChange={setOnlineOnly} />
    </OnboardingStep>
  );
}
