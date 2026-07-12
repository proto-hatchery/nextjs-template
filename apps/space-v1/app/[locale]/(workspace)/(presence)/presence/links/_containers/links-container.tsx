"use client";

import { checkPublicProfileSlugAction } from "@workspace/supabase-data/actions/public-profile/check-public-profile-slug";
import {
  uploadPublicProfileAvatarAction,
  uploadPublicProfileBackgroundAction,
} from "@workspace/supabase-data/actions/public-profile/upload-public-profile-image";
import type { OnboardingPhase7DraftData } from "@workspace/supabase-data/types/entities";
import {
  usePsychologist,
  usePsychologistOnboardingStates,
} from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import {
  usePsychologistPublicLinks,
  usePsychologistPublicProfile,
  usePublicProfileActions,
} from "@workspace/supabase-data/hooks/public-profile";
import { Card, CardContent } from "@workspace/ui/components/card";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { LinksView } from "../_components/links-view";
import {
  buildDefaultLinks,
  buildEssentialLinktreeLinks,
  type EssentialLinkKey,
  type Link,
  mapLinktreeLinks,
  mergeEssentialLinks,
  normalizeSocialLinks,
  type SocialLinks,
  updateLinksWithSlug,
} from "../_data/linktree-links";

export function LinksContainer() {
  const router = useRouter();
  const { data: psychologist, isPending: isPsychologistLoading } = usePsychologist();
  const { data: profile, isPending: isProfileLoading } = usePsychologistPublicProfile();
  const { data: linktreeLinks, isPending: isLinksLoading } = usePsychologistPublicLinks();
  const { data: onboardingState, isPending: isOnboardingLoading } =
    usePsychologistOnboardingStates();
  const { updateProfile, upsertLinks } = usePublicProfileActions();

  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [linktreeSlug, setLinktreeSlug] = useState("");
  const [validatedSlug, setValidatedSlug] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarPath, setAvatarPath] = useState<string | undefined>(undefined);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | undefined>(undefined);
  const [backgroundImagePath, setBackgroundImagePath] = useState<string | undefined>(undefined);
  const [themeId, setThemeId] = useState("classic");
  const [links, setLinks] = useState<Link[]>([]);
  const [socials, setSocials] = useState<SocialLinks>({});
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const hasInitialized = useRef(false);
  const skipProfileSave = useRef(true);
  const skipLinksSave = useRef(true);

  const mappedLinks = useMemo(() => mapLinktreeLinks(linktreeLinks ?? null), [linktreeLinks]);

  useEffect(() => {
    if (hasInitialized.current) return;
    if (isPsychologistLoading || isProfileLoading || isLinksLoading || isOnboardingLoading) return;

    // 1. Try to get data from public_profiles (final state)
    // 2. Fallback to onboarding draft (draft state)
    // 3. Fallback to basic psychologist record

    const draftData: OnboardingPhase7DraftData =
      (onboardingState?.draft_data as { phase7?: OnboardingPhase7DraftData })?.phase7 ?? {};

    const initialSlug = profile?.slug ?? draftData.slug ?? "";
    const initialDisplayName =
      profile?.display_name ??
      draftData.displayName ??
      psychologist?.display_name ??
      psychologist?.full_name ??
      "";

    const initialBio = profile?.bio ?? draftData.bio ?? "";
    const initialTagline = profile?.tagline ?? draftData.tagline ?? "";
    const initialAvatarUrl = profile?.avatar_url ?? draftData.avatarUrl ?? undefined;
    const initialAvatarPath = profile?.avatar_path ?? draftData.avatarPath ?? undefined;
    const initialTheme = profile?.linktree_theme ?? draftData.linktreeTheme ?? "classic";
    const initialSocials = normalizeSocialLinks(profile?.social_links ?? draftData.socials);

    // For links, prioritize database links, then draft links, then defaults
    let initialLinks = mappedLinks;
    if (!initialLinks && draftData.links) {
      initialLinks = draftData.links.map((l) => ({
        id: l.id ?? crypto.randomUUID(),
        title: l.title ?? "",
        url: l.url ?? "",
        active: l.active ?? true,
      }));
    }

    // If still no links, build defaults
    initialLinks ??= buildDefaultLinks(initialSlug, psychologist?.phone);

    setLinktreeSlug(initialSlug);
    setValidatedSlug(initialSlug);
    setDisplayName(initialDisplayName);
    setTagline(initialTagline);
    setBio(initialBio);
    setAvatarUrl(initialAvatarUrl);
    setAvatarPath(initialAvatarPath);
    setBackgroundImageUrl(profile?.background_url ?? undefined);
    setBackgroundImagePath(profile?.background_path ?? undefined);
    setThemeId(initialTheme);
    setSocials(initialSocials);
    setLinks(initialLinks);

    hasInitialized.current = true;
  }, [
    isPsychologistLoading,
    isProfileLoading,
    isLinksLoading,
    isOnboardingLoading,
    profile,
    psychologist,
    onboardingState,
    mappedLinks,
  ]);

  // Sync avatar_url from profile when it changes (e.g., after onboarding or cache invalidation)
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile?.avatar_url]);

  const debouncedSaveProfile = useDebouncedCallback(
    (input: {
      displayName: string;
      tagline: string;
      bio: string;
      avatarUrl?: string;
      avatarPath?: string;
      backgroundUrl?: string;
      backgroundPath?: string;
      themeId?: string;
      usernameSlug: string;
      socialLinks: SocialLinks;
    }) => {
      updateProfile.mutate({
        displayName: input.displayName,
        tagline: input.tagline,
        bio: input.bio,
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
        ...(input.avatarPath !== undefined ? { avatarPath: input.avatarPath } : {}),
        ...(input.backgroundUrl !== undefined ? { backgroundUrl: input.backgroundUrl } : {}),
        ...(input.backgroundPath !== undefined ? { backgroundPath: input.backgroundPath } : {}),
        ...(input.themeId !== undefined ? { linktreeTheme: input.themeId } : {}),
        usernameSlug: input.usernameSlug,
        socialLinks: input.socialLinks,
      });
    },
    600,
  );

  const debouncedSaveLinks = useDebouncedCallback((nextLinks: Link[]) => {
    upsertLinks.mutate({
      links: nextLinks.map((link, index) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        isActive: link.active,
        sortOrder: index,
      })),
    });
  }, 600);

  useEffect(() => {
    if (!hasInitialized.current) return;
    if (skipProfileSave.current) {
      skipProfileSave.current = false;
      return;
    }
    if (!validatedSlug) return;

    debouncedSaveProfile({
      displayName,
      tagline,
      bio,
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(avatarPath !== undefined ? { avatarPath } : {}),
      ...(backgroundImageUrl !== undefined ? { backgroundUrl: backgroundImageUrl } : {}),
      ...(backgroundImagePath !== undefined ? { backgroundPath: backgroundImagePath } : {}),
      ...(themeId !== undefined ? { themeId } : {}),
      usernameSlug: validatedSlug,
      socialLinks: socials,
    });
  }, [
    displayName,
    tagline,
    bio,
    avatarUrl,
    avatarPath,
    backgroundImageUrl,
    backgroundImagePath,
    themeId,
    socials,
    validatedSlug,
    debouncedSaveProfile,
  ]);

  useEffect(() => {
    if (!hasInitialized.current) return;
    if (skipLinksSave.current) {
      skipLinksSave.current = false;
      return;
    }

    debouncedSaveLinks(links);
  }, [links, debouncedSaveLinks]);

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
      return;
    }

    setSlugError(null);
    setValidatedSlug(linktreeSlug);
    setLinks((prevLinks) => updateLinksWithSlug(prevLinks, linktreeSlug));
  };

  const handleAddEssentialLinks = () => {
    const essentials = mergeEssentialLinks(
      links,
      validatedSlug || linktreeSlug,
      psychologist?.phone,
    );
    const essentialEntries = Object.values(essentials);
    const nonEssential = links.filter((link) => {
      const isEssential = (Object.keys(essentials) as EssentialLinkKey[]).some((key) => {
        return essentials[key].id === link.id;
      });
      return !isEssential;
    });
    setLinks([...essentialEntries, ...nonEssential]);
  };

  const handleAvatarUpload = async (
    croppedImage: string,
  ): Promise<{ url: string; path?: string } | null> => {
    const result = await uploadPublicProfileAvatarAction({
      croppedImage,
      previousUrl: avatarUrl,
      previousPath: avatarPath,
    });
    if (!result.success) {
      return null;
    }
    setAvatarUrl(result.data.url);
    setAvatarPath(result.data.path);
    return result.data;
  };

  const handleBackgroundUpload = async (
    croppedImage: string,
  ): Promise<{ url: string; path?: string } | null> => {
    const result = await uploadPublicProfileBackgroundAction({
      croppedImage,
      previousUrl: backgroundImageUrl,
      previousPath: backgroundImagePath,
    });
    if (!result.success) {
      return null;
    }
    setBackgroundImageUrl(result.data.url);
    setBackgroundImagePath(result.data.path);
    return result.data;
  };

  const handleResetEssentialLinks = () => {
    const defaults = buildEssentialLinktreeLinks(
      validatedSlug || linktreeSlug,
      psychologist?.phone,
    );
    const nonEssential = links.filter(
      (link) =>
        !link.url.includes("/agendar") &&
        !link.url.includes("/sobre") &&
        !link.url.includes("wa.me"),
    );
    setLinks([defaults.schedule, defaults.about, defaults.whatsapp, ...nonEssential]);
  };

  if (
    !isPsychologistLoading &&
    !isProfileLoading &&
    !isOnboardingLoading &&
    (!profile?.slug || !profile?.is_public)
  ) {
    const draftData: OnboardingPhase7DraftData =
      (onboardingState?.draft_data as { phase7?: OnboardingPhase7DraftData })?.phase7 ?? {};
    const hasDraft = !!draftData.slug;

    if (!hasDraft) {
      return (
        <div className="flex h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] items-center justify-center px-6">
          <Card className="max-w-xl border-0 shadow-none bg-transparent">
            <CardContent className="space-y-4 rounded-2xl bg-white p-6">
              <h2 className="text-xl font-semibold tracking-tight">
                Finalize o onboarding para editar links
              </h2>
              <p className="text-sm text-muted-foreground">
                Conclua a ativação e publicação inicial para liberar o editor completo de links.
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
    <LinksView
      displayName={displayName}
      linktreeSlug={linktreeSlug}
      tagline={tagline}
      {...(avatarUrl !== undefined ? { avatarUrl } : {})}
      {...(avatarPath !== undefined ? { avatarPath } : {})}
      {...(backgroundImageUrl !== undefined ? { backgroundImageUrl } : {})}
      {...(backgroundImagePath !== undefined ? { backgroundImagePath } : {})}
      themeId={themeId}
      links={links}
      socials={socials}
      slugError={slugError}
      isCheckingSlug={isCheckingSlug}
      onAddEssentialLinks={handleAddEssentialLinks}
      onResetEssentialLinks={handleResetEssentialLinks}
      onDisplayNameChange={setDisplayName}
      onSlugChange={(value) => {
        setSlugError(null);
        setLinktreeSlug(value);
      }}
      onSlugBlur={() => void handleSlugBlur()}
      onTaglineChange={setTagline}
      onAvatarUrlChange={setAvatarUrl}
      onAvatarPathChange={setAvatarPath}
      onBackgroundImageUrlChange={setBackgroundImageUrl}
      onBackgroundImagePathChange={setBackgroundImagePath}
      onThemeIdChange={setThemeId}
      onLinksChange={setLinks}
      onSocialsChange={setSocials}
      onAvatarUpload={handleAvatarUpload}
      onBackgroundUpload={handleBackgroundUpload}
    />
  );
}
