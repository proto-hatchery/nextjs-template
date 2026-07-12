"use client";

import { OnboardingStep } from "@workspace/brand/onboarding";
import { saveProfileLinksAction } from "@workspace/supabase-data/actions/onboarding/steps/profile-steps-action";
import type { FluriLink } from "@workspace/ui/lib/linktree-links";
import { buildEssentialLinktreeLinks } from "@workspace/ui/lib/linktree-links";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Step2Links } from "../_components/steps/step-2-links";

interface LinksPageClientProps {
  initialData: {
    slug: string;
    phone?: string;
    links: FluriLink[];
  };
}

/**
 * Initialize links with default essential links if empty
 */
function getInitialLinks(initialLinks: FluriLink[], slug: string, phone?: string): FluriLink[] {
  if (initialLinks.length > 0) {
    return initialLinks;
  }
  // Pre-populate with default essential links so the "Continue" button is enabled
  const defaults = buildEssentialLinktreeLinks(slug, phone);
  return [defaults.schedule, defaults.about, defaults.whatsapp].filter(
    (l): l is FluriLink => l !== undefined,
  );
}

export default function LinksPageClient({ initialData }: LinksPageClientProps) {
  const router = useRouter();
  const [links, setLinks] = useState<FluriLink[]>(() =>
    getInitialLinks(initialData.links, initialData.slug, initialData.phone),
  );
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    startTransition(async () => {
      const result = await saveProfileLinksAction({ links });

      if (result.success) {
        router.push("/onboarding/visual");
        return;
      }

      toast.error(result.error?.message || "Erro ao salvar links");
    });
  };

  return (
    <OnboardingStep
      title="Links essenciais"
      description="Organize os links principais que os pacientes verão no seu perfil."
      onBack={() => router.push("/onboarding/slug")}
      onContinue={handleContinue}
      continueLabel={isPending ? "Salvando..." : "Continuar para visual"}
      continueDisabled={
        links.filter((l) => l.active && l.title.trim() && l.url.trim()).length === 0 || isPending
      }
      isPending={isPending}
    >
      <Step2Links
        slug={initialData.slug}
        links={links}
        phone={initialData.phone}
        onChange={setLinks}
      />
    </OnboardingStep>
  );
}
