"use client";

import { getLinktreeTheme, getRoundedClasses } from "@/compat/supabase/utils/linktree-themes";

import { SharePopover } from "@/app/_components/sharing/SharePopover";

import { DeviceFrame } from "./mobile-preview/DeviceFrame";

interface Link {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  spotify?: string;
  linkedin?: string;
}

interface MobilePreviewProps {
  displayName: string;
  /** Linktree slug: public URL segment (e.g.: me.fluri.com.br/[slug]) */
  linktreeSlug: string;
  subtitle: string;
  avatarUrl?: string;
  backgroundImageUrl?: string;
  links: Link[];
  socials: SocialLinks;
  themeId?: string;
}

export function MobilePreview({
  displayName,
  linktreeSlug,
  subtitle,
  avatarUrl,
  backgroundImageUrl,
  links,
  socials,
  themeId,
}: MobilePreviewProps) {
  const activeLinks = links.filter((link) => link.active);
  const profileUrl = `me.fluri.com.br/${linktreeSlug}`;
  const theme = getLinktreeTheme(themeId);
  const { button: buttonRadius } = getRoundedClasses(theme.rounded);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[320px] mx-auto">
      <SharePopover profileUrl={profileUrl} theme={theme} buttonRadius={buttonRadius} />

      <DeviceFrame
        displayName={displayName}
        subtitle={subtitle}
        activeLinks={activeLinks}
        socials={socials}
        theme={theme}
        {...(avatarUrl !== undefined ? { avatarUrl } : {})}
        {...(backgroundImageUrl !== undefined ? { backgroundImageUrl } : {})}
      />
    </div>
  );
}
