"use client";

import type { OnboardingPhase7DraftData } from "@workspace/supabase-data/types/entities";
import { usePsychologistOnboardingStates } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import {
  usePsychologistPublicProfile,
  usePublicProfileActions,
} from "@workspace/supabase-data/hooks/public-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { CheckCircle2, Copy, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { normalizeLinktreeSlug } from "./links/_data/linktree-links";

function toPublicUrl(slug: string): string {
  return `https://me.fluri.com.br/${slug}`;
}

function toProfilePath(slug: string): string {
  return `${toPublicUrl(slug)}/profile`;
}

export default function PersonalWebsitePage() {
  const router = useRouter();
  const { data: profile, isPending: isProfileLoading } = usePsychologistPublicProfile();
  const { data: onboardingState, isPending: isOnboardingLoading } =
    usePsychologistOnboardingStates();
  const { updatePublicationPreferences } = usePublicProfileActions();

  const [copied, setCopied] = useState(false);

  // REDIRECT LOGIC
  // Redirect logic removed to prevent loop when exiting onboarding.
  // The UI already handles the empty state via 'isEssentialLink' checks or similar empty states in child components.
  // We can rely on the user clicking the setup button.

  const draftData: OnboardingPhase7DraftData = useMemo(
    () => (onboardingState?.draft_data as { phase7?: OnboardingPhase7DraftData })?.phase7 ?? {},
    [onboardingState],
  );

  const existingSlug = useMemo(
    () => normalizeLinktreeSlug(profile?.slug ?? draftData.slug ?? ""),
    [profile?.slug, draftData.slug],
  );

  const profileUrl = useMemo(() => toPublicUrl(existingSlug), [existingSlug]);

  const shareUrl = useMemo(() => toProfilePath(existingSlug), [existingSlug]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isLoading = isProfileLoading || isOnboardingLoading;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-700" />
      </div>
    );
  }

  // If we are here, we theoretically have a slug (or are redirecting).
  const hasSlug = Boolean(profile?.slug ?? draftData.slug);

  if (!hasSlug) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 bg-zinc-100 rounded-full">
          <Sparkles className="size-8 text-zinc-500" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-semibold">Configure seu site pessoal</h1>
          <p className="text-zinc-500">
            Você ainda não configurou seu site. Complete o passo a passo para criar sua presença
            online.
          </p>
        </div>
        <BrandButton size="lg" onClick={() => router.push("/onboarding")}>
          Começar agora
        </BrandButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600" />
            Site publicado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Seu site pessoal está ativo em{" "}
            <span className="font-medium text-foreground">{profileUrl}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <BrandButton
              onClick={() => void handleCopyLink()}
              variant="secondary"
              className="gap-2"
            >
              <Copy className="size-4" />
              {copied ? "Copiado" : "Copiar link"}
            </BrandButton>
            <BrandButton
              variant="neutral"
              onClick={() => router.push("/personal-website/profile-data")}
            >
              Editar perfil
            </BrandButton>
            <BrandButton variant="neutral" onClick={() => router.push("/personal-website/links")}>
              Editar links
            </BrandButton>
            <BrandButton
              variant="neutral"
              onClick={() => router.push("/personal-website/preferences")}
            >
              Preferências
            </BrandButton>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Controles rápidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Visível publicamente</p>
              <p className="text-sm text-muted-foreground">Desative para tirar seu site do ar.</p>
            </div>
            <Switch
              checked={Boolean(profile?.is_public)}
              onCheckedChange={(checked) =>
                void updatePublicationPreferences({
                  isPublic: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
