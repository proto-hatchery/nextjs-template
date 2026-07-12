import { LinktreeLayout } from "@/compat/features/public-profile/ui/linktree-layout";
import type { LinktreeTheme } from "@/compat/supabase/utils/linktree-themes";
import type { ReactNode } from "react";

import { SocialIcons } from "@/app/_components/sharing/SocialIcons";

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  spotify?: string;
  linkedin?: string;
}

interface MobileDeviceSimulatorProps {
  displayName: string;
  subtitle: string;
  avatarUrl?: string;
  backgroundImageUrl?: string;
  theme: LinktreeTheme;
  socials: SocialLinks;
  hideCover?: boolean;
  children?: ReactNode;
}

export function MobileDeviceSimulator({
  displayName,
  subtitle,
  avatarUrl,
  backgroundImageUrl,
  theme,
  socials,
  hideCover = false,
  children,
}: MobileDeviceSimulatorProps) {
  return (
    <div className="mx-auto flex w-full max-w-[320px] flex-col items-center">
      <div className="relative h-[640px] w-full rounded-[3rem] border-[8px] border-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden bg-white ring-1 ring-zinc-900/10">
        <LinktreeLayout
          mode="linktree"
          theme={theme}
          displayName={displayName || "Seu Nome"}
          subtitle={subtitle || ""}
          className="h-full w-full border-none"
          headerSlot={<SocialIcons socials={socials} color={theme.colors.foreground} />}
          hideCover={hideCover}
          {...(avatarUrl !== undefined ? { avatarUrl } : {})}
          {...(backgroundImageUrl !== undefined ? { backgroundImageUrl } : {})}
        >
          <div className="mt-4 flex w-full flex-col items-center">
            <div className="-mt-2 flex w-full max-w-[280px] flex-1 flex-col text-left">
              <div className="w-full space-y-3 pr-1 pb-6">{children}</div>
            </div>
          </div>
        </LinktreeLayout>
      </div>
    </div>
  );
}
