"use client";

import type { Link, SocialLinks } from "../_data/linktree-links";
import { LinksEditor } from "./links-editor";
import { MobilePreview } from "./mobile-preview";

interface LinksViewProps {
  displayName: string;
  linktreeSlug: string;
  tagline: string;
  avatarUrl?: string;
  avatarPath?: string;
  backgroundImageUrl?: string;
  backgroundImagePath?: string;
  themeId: string;
  links: Link[];
  socials: SocialLinks;
  slugError: string | null;
  isCheckingSlug: boolean;
  onAddEssentialLinks: () => void;
  onResetEssentialLinks: () => void;
  onDisplayNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSlugBlur: () => void;
  onTaglineChange: (value: string) => void;
  onAvatarUrlChange: (value?: string) => void;
  onAvatarPathChange: (value?: string) => void;
  onBackgroundImageUrlChange: (value?: string) => void;
  onBackgroundImagePathChange: (value?: string) => void;
  onThemeIdChange: (value: string) => void;
  onLinksChange: (value: Link[] | ((items: Link[]) => Link[])) => void;
  onSocialsChange: (value: SocialLinks) => void;
  onAvatarUpload?: (croppedImage: string) => Promise<{ url: string; path?: string } | null>;
  onBackgroundUpload?: (croppedImage: string) => Promise<{ url: string; path?: string } | null>;
}

export function LinksView({
  displayName,
  linktreeSlug,
  tagline,
  avatarUrl,
  avatarPath,
  backgroundImageUrl,
  backgroundImagePath,
  themeId,
  links,
  socials,
  slugError,
  isCheckingSlug,
  onAddEssentialLinks,
  onResetEssentialLinks,
  onDisplayNameChange,
  onSlugChange,
  onSlugBlur,
  onTaglineChange,
  onAvatarUrlChange,
  onAvatarPathChange,
  onBackgroundImageUrlChange,
  onBackgroundImagePathChange,
  onThemeIdChange,
  onLinksChange,
  onSocialsChange,
  onAvatarUpload,
  onBackgroundUpload,
}: LinksViewProps) {
  return (
    <div className="flex h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] gap-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto py-8 px-8 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-3xl mx-auto lg:mx-0">
          <LinksEditor
            displayName={displayName}
            setDisplayName={onDisplayNameChange}
            linktreeSlug={linktreeSlug}
            setLinktreeSlug={onSlugChange}
            onSlugBlur={onSlugBlur}
            slugError={slugError}
            isCheckingSlug={isCheckingSlug}
            tagline={tagline}
            setTagline={onTaglineChange}
            {...(avatarUrl !== undefined ? { avatarUrl } : {})}
            setAvatarUrl={onAvatarUrlChange}
            {...(avatarPath !== undefined ? { avatarPath } : {})}
            setAvatarPath={onAvatarPathChange}
            {...(backgroundImageUrl !== undefined ? { backgroundImageUrl } : {})}
            setBackgroundImageUrl={onBackgroundImageUrlChange}
            {...(backgroundImagePath !== undefined ? { backgroundImagePath } : {})}
            setBackgroundImagePath={onBackgroundImagePathChange}
            themeId={themeId}
            setThemeId={onThemeIdChange}
            links={links}
            setLinks={onLinksChange}
            socials={socials}
            setSocials={onSocialsChange}
            onAddEssentialLinks={onAddEssentialLinks}
            onResetEssentialLinks={onResetEssentialLinks}
            {...(onAvatarUpload !== undefined ? { onAvatarUpload } : {})}
            {...(onBackgroundUpload !== undefined ? { onBackgroundUpload } : {})}
          />
        </div>
      </div>

      <div className="hidden lg:block w-px h-full bg-zinc-200 shrink-0" />

      <div className="hidden lg:flex shrink-0 w-[450px] flex-col items-center justify-center bg-zinc-50/50 px-8 py-10">
        <MobilePreview
          displayName={displayName}
          linktreeSlug={linktreeSlug}
          subtitle={tagline}
          {...(avatarUrl !== undefined ? { avatarUrl } : {})}
          {...(backgroundImageUrl !== undefined ? { backgroundImageUrl } : {})}
          links={links}
          socials={socials}
          themeId={themeId}
        />
      </div>
    </div>
  );
}
