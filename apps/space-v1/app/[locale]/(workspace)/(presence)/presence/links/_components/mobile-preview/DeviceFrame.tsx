"use client";

import { LinktreeButton } from "@/compat/features/public-profile/ui/linktree-button";
import type { LinktreeTheme } from "@/compat/supabase/utils/linktree-themes";
import { AnimatePresence, motion } from "motion/react";

import { MobileDeviceSimulator } from "../../../_components/mobile-device-simulator";

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

interface DeviceFrameProps {
  displayName: string;
  subtitle: string;
  avatarUrl?: string;
  backgroundImageUrl?: string;
  activeLinks: Link[];
  socials: SocialLinks;
  theme: LinktreeTheme;
}

export function DeviceFrame({
  displayName,
  subtitle,
  avatarUrl,
  backgroundImageUrl,
  activeLinks,
  socials,
  theme,
}: DeviceFrameProps) {
  return (
    <MobileDeviceSimulator
      displayName={displayName}
      subtitle={subtitle}
      theme={theme}
      socials={socials}
      {...(avatarUrl !== undefined ? { avatarUrl } : {})}
      {...(backgroundImageUrl !== undefined ? { backgroundImageUrl } : {})}
    >
      <AnimatePresence mode="popLayout">
        {activeLinks.map((link, index) => (
          <motion.div
            key={link.id}
            layout
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              delay: index * 0.05,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="w-full"
          >
            <LinktreeButton asChild theme={theme} index={index} className="w-full text-sm">
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <span className="truncate text-center">{link.title}</span>
              </a>
            </LinktreeButton>
          </motion.div>
        ))}
      </AnimatePresence>
    </MobileDeviceSimulator>
  );
}
