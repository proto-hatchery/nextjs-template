"use client";

import { getLinktreeTheme, getRoundedClasses } from "@/compat/supabase/utils/linktree-themes";

import { SharePopover } from "@/app/_components/sharing/SharePopover";

import { LinktreeHeader } from "../../_components/linktree-header";
import type { ProfileData, SocialLinks } from "../_data/profile-data";
import { ProfileEditor } from "./profile-editor-simple";
import { ProfilePreview } from "./profile-preview";

interface ProfileDataViewProps {
  profileData: ProfileData;
  socials: SocialLinks;
  linktreeSlug: string;
  slugError: string | null;
  isCheckingSlug: boolean;
  profileUrl: string;
  themeId: string | null | undefined;
  onProfileDataChange: (
    data: Partial<ProfileData> | ((prev: ProfileData) => Partial<ProfileData>),
  ) => void;
  onSocialsChange: (value: SocialLinks) => void;
  onSlugChange: (value: string) => void;
  onSlugBlur: () => void;
  onCommit: () => void;
}

export function ProfileDataView({
  profileData,
  socials,
  linktreeSlug,
  slugError,
  isCheckingSlug,
  profileUrl,
  themeId,
  onProfileDataChange,
  onSocialsChange,
  onSlugChange,
  onSlugBlur,
  onCommit,
}: ProfileDataViewProps) {
  const theme = getLinktreeTheme(themeId ?? null);
  const { button: buttonRadius } = getRoundedClasses(theme.rounded);

  return (
    <div className="flex h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] gap-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto py-8 px-8 bg-zinc-50/70 no-scrollbar">
        <div className="max-w-3xl mx-auto lg:mx-0">
          <LinktreeHeader
            displayName={profileData.displayName}
            setDisplayName={(val) =>
              onProfileDataChange((prev) => ({
                ...prev,
                displayName: val,
              }))
            }
            tagline={profileData.tagline}
            setTagline={(val) =>
              onProfileDataChange((prev) => ({
                ...prev,
                tagline: val,
              }))
            }
            linktreeSlug={linktreeSlug}
            setLinktreeSlug={onSlugChange}
            onSlugBlur={onSlugBlur}
            slugError={slugError}
            isCheckingSlug={isCheckingSlug}
            avatarUrl={profileData.avatarUrl}
            setAvatarUrl={(val) =>
              onProfileDataChange((prev) => ({
                ...prev,
                avatarUrl: val ?? "",
              }))
            }
            avatarPath={profileData.avatarPath}
            setAvatarPath={(val) =>
              onProfileDataChange((prev) => ({
                ...prev,
                avatarPath: val ?? "",
              }))
            }
            socials={socials}
            setSocials={onSocialsChange}
          />

          <ProfileEditor
            profileData={profileData}
            setProfileData={onProfileDataChange}
            onCommit={onCommit}
          />
        </div>
      </div>

      <div className="hidden lg:block w-px h-full bg-zinc-200 shrink-0" />

      <div className="hidden lg:flex shrink-0 w-[450px] flex-col items-center justify-center bg-zinc-50/50 px-8 py-10">
        <div className="mb-6">
          <SharePopover profileUrl={profileUrl} theme={theme} buttonRadius={buttonRadius} />
        </div>
        <ProfilePreview
          displayName={profileData.displayName}
          tagline={profileData.tagline}
          avatarUrl={profileData.avatarUrl}
          theme={theme}
          socials={socials}
        />
      </div>
    </div>
  );
}
