"use client";

import { checkPublicProfileSlugAction } from "@workspace/supabase-data/actions/public-profile/check-public-profile-slug";
import { updatePublicProfileAction } from "@workspace/supabase-data/actions/public-profile/update-public-profile";
import type { OnboardingPhase7DraftData } from "@workspace/supabase-data/types/entities";
import {
  usePsychologist,
  usePsychologistOnboardingStates,
} from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import {
  usePsychologistPublicProfile,
  usePublicProfileActions,
} from "@workspace/supabase-data/hooks/public-profile";
import { Card, CardContent } from "@workspace/ui/components/card";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProfileDataView } from "../_components/profile-data-view";
import {
  buildProfileData,
  buildUpdateData,
  normalizeSocialLinks,
  type ProfileData,
  type SocialLinks,
} from "../_data/profile-data";

export function ProfileDataContainer() {
  const router = useRouter();
  const { data: psychologist, isPending: isPsychologistLoading } = usePsychologist();
  const { data: profile, isPending: isProfileLoading } = usePsychologistPublicProfile();
  const { data: onboardingState, isPending: isOnboardingLoading } =
    usePsychologistOnboardingStates();
  const { updateProfile } = usePublicProfileActions();

  const [linktreeSlug, setLinktreeSlug] = useState("");
  const [validatedSlug, setValidatedSlug] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [socials, setSocials] = useState<SocialLinks>({});

  const hasInitialized = useRef(false);
  const skipProfileSave = useRef(true);
  const skipHeaderSave = useRef(true);

  const profileSlug = useMemo(
    () => linktreeSlug ?? profile?.slug ?? "",
    [linktreeSlug, profile?.slug],
  );
  const profileUrl = `me.fluri.com.br/${profileSlug ?? "seu-usuario"}/profile`;

  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "",
    tagline: "",
    bio: "",
    avatarUrl: "",
    avatarPath: "",
    backgroundUrl: "",
    backgroundPath: "",
    city: "",
    state: "",
    languages: ["Português"],
    keywords: [],
    therapeuticApproaches: [],
    academicTimeline: [],
    professionalTimeline: [],
    registeredSpecialties: [],
    galleryPhotos: [],
    profileSections: [],
    videoSection: { url: "" },
    isPublic: true,
    showInMarketplace: false,
  });

  useEffect(() => {
    if (hasInitialized.current || isPsychologistLoading || isProfileLoading || isOnboardingLoading)
      return;

    // 1. Try to get data from public_profiles (final state)
    // 2. Fallback to onboarding draft (draft state)
    // 3. Fallback to basic psychologist record

    const draftData: OnboardingPhase7DraftData =
      (onboardingState?.draft_data as { phase7?: OnboardingPhase7DraftData })?.phase7 ?? {};

    const nextProfileData = buildProfileData({
      profile: profile ?? {
        display_name: draftData.displayName,
        tagline: draftData.tagline,
        bio: draftData.bio,
        avatar_url: draftData.avatarUrl,
        avatar_path: draftData.avatarPath,
        background_url: draftData.backgroundUrl,
        background_path: draftData.backgroundPath,
        specialties: draftData.specialties,
        therapeutic_approaches: draftData.therapeuticApproaches,
        academic_timeline: draftData.academicTimeline,
        professional_timeline: draftData.professionalTimeline,
        show_in_marketplace: draftData.showInMarketplace,
        is_public: true,
      },
      psychologist,
    });
    setProfileData(nextProfileData);

    const initialSlug = String(profile?.slug ?? draftData.slug ?? "");
    setLinktreeSlug(initialSlug);
    setValidatedSlug(initialSlug);
    setSocials(normalizeSocialLinks(profile?.social_links ?? draftData.socials));
    hasInitialized.current = true;
  }, [
    isPsychologistLoading,
    isProfileLoading,
    isOnboardingLoading,
    profile,
    psychologist,
    onboardingState,
  ]);

  const debouncedSave = useDebouncedCallback((input: ProfileData) => {
    if (psychologist) {
      updatePublicProfileAction(buildUpdateData(input)).catch(() => {
        /* empty */
      });
    }
  }, 600);

  useEffect(() => {
    if (!hasInitialized.current) return;
    if (skipProfileSave.current) {
      skipProfileSave.current = false;
      return;
    }
    debouncedSave(profileData);
  }, [profileData, debouncedSave]);

  const debouncedSaveHeader = useDebouncedCallback(
    (input: {
      displayName: string;
      tagline: string;
      bio: string;
      avatarUrl: string;
      avatarPath: string;
      backgroundUrl: string;
      backgroundPath: string;
      usernameSlug: string;
      socialLinks: SocialLinks;
    }) => {
      updateProfile.mutate(input);
    },
    600,
  );

  useEffect(() => {
    if (!hasInitialized.current || skipHeaderSave.current || !validatedSlug) {
      if (hasInitialized.current) skipHeaderSave.current = false;
      return;
    }
    debouncedSaveHeader({
      displayName: profileData.displayName,
      tagline: profileData.tagline,
      bio: profileData.bio,
      avatarUrl: profileData.avatarUrl,
      avatarPath: profileData.avatarPath,
      backgroundUrl: profileData.backgroundUrl,
      backgroundPath: profileData.backgroundPath,
      usernameSlug: validatedSlug,
      socialLinks: socials,
    });
  }, [
    profileData.displayName,
    profileData.tagline,
    profileData.bio,
    profileData.avatarUrl,
    profileData.avatarPath,
    profileData.backgroundUrl,
    profileData.backgroundPath,
    validatedSlug,
    socials,
    debouncedSaveHeader,
  ]);

  const handleSlugBlur = async () => {
    if (!linktreeSlug || linktreeSlug === validatedSlug) {
      setSlugError(null);
      return;
    }
    setIsCheckingSlug(true);
    const result = await checkPublicProfileSlugAction({ slug: linktreeSlug });
    setIsCheckingSlug(false);
    if (!result.success || !result.data.available) {
      setSlugError(result.success ? "Essa URL já está em uso. Tente outra." : result.error.message);
      setLinktreeSlug(validatedSlug);
    } else {
      setSlugError(null);
      setValidatedSlug(linktreeSlug);
    }
  };

  if (isPsychologistLoading || isProfileLoading || isOnboardingLoading) {
    return (
      <div className="flex h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile?.slug || !profile?.is_public) {
    const draftData: OnboardingPhase7DraftData =
      (onboardingState?.draft_data as { phase7?: OnboardingPhase7DraftData })?.phase7 ?? {};
    const hasDraft = !!draftData.slug;

    if (!hasDraft) {
      return (
        <div className="flex h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] items-center justify-center px-6">
          <Card className="max-w-xl border-0 shadow-none bg-transparent">
            <CardContent className="space-y-4 rounded-2xl bg-white p-6">
              <h2 className="text-xl font-semibold tracking-tight">
                Finalize o onboarding para editar esta página
              </h2>
              <p className="text-sm text-muted-foreground">
                Para manter a publicação consistente, os dados avançados são liberados após concluir
                a ativação do site pessoal.
              </p>
              <BrandButton onClick={() => router.push("/onboarding")}>
                Ir para onboarding
              </BrandButton>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return (
    <ProfileDataView
      profileData={profileData}
      socials={socials}
      linktreeSlug={linktreeSlug}
      slugError={slugError}
      isCheckingSlug={isCheckingSlug}
      profileUrl={profileUrl}
      themeId={profile?.linktree_theme ?? null}
      onProfileDataChange={(data) =>
        setProfileData((prev) => ({
          ...prev,
          ...(typeof data === "function" ? data(prev) : data),
        }))
      }
      onSocialsChange={setSocials}
      onSlugChange={(val) => {
        setSlugError(null);
        setLinktreeSlug(val);
      }}
      onSlugBlur={() => void handleSlugBlur()}
      onCommit={() => void updatePublicProfileAction(buildUpdateData(profileData))}
    />
  );
}
