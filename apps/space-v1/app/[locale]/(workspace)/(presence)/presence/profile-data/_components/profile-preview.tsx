"use client";

import type { LinktreeTheme } from "@/compat/supabase/utils/linktree-themes";

import { MobileDeviceSimulator } from "../../_components/mobile-device-simulator";

const _unused = true;

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  spotify?: string;
  linkedin?: string;
}

interface ProfilePreviewProps {
  displayName: string;
  tagline: string;
  avatarUrl: string;
  backgroundUrl?: string;
  theme: LinktreeTheme;
  socials: SocialLinks;
}

export function ProfilePreview({
  displayName,
  tagline,
  avatarUrl,
  backgroundUrl: _backgroundUrl,
  theme,
  socials,
}: ProfilePreviewProps) {
  return (
    <MobileDeviceSimulator
      displayName={displayName}
      subtitle={tagline}
      avatarUrl={avatarUrl}
      theme={theme}
      socials={socials}
      hideCover={true}
    >
      {/* Empty layout to focus on the frame as per task request */}
    </MobileDeviceSimulator>
  );
}
