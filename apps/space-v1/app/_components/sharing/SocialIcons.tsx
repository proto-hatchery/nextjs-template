"use client";

import {
  RiInstagramFill,
  RiLinkedinBoxFill,
  RiSpotifyFill,
  RiTiktokFill,
  RiTwitterXFill,
  RiYoutubeFill,
} from "@remixicon/react";
import { motion } from "motion/react";

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  spotify?: string;
  linkedin?: string;
}

interface SocialIconsProps {
  socials: SocialLinks;
  color: string;
}

export function SocialIcons({ socials, color }: SocialIconsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <SocialIcon
        icon={<RiInstagramFill className="size-5" />}
        show={!!socials.instagram}
        color={color}
      />
      <SocialIcon
        icon={<RiTiktokFill className="size-5" />}
        show={!!socials.tiktok}
        color={color}
      />
      <SocialIcon
        icon={<RiYoutubeFill className="size-5" />}
        show={!!socials.youtube}
        color={color}
      />
      <SocialIcon
        icon={<RiTwitterXFill className="size-5" />}
        show={!!socials.twitter}
        color={color}
      />
      <SocialIcon
        icon={<RiSpotifyFill className="size-5" />}
        show={!!socials.spotify}
        color={color}
      />
      <SocialIcon
        icon={<RiLinkedinBoxFill className="size-5" />}
        show={!!socials.linkedin}
        color={color}
      />
    </div>
  );
}

function SocialIcon({
  icon,
  show,
  color,
}: {
  icon: React.ReactNode;
  show: boolean;
  color: string;
}) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      className="cursor-pointer transition-opacity opacity-70 hover:opacity-100"
      style={{ color }}
    >
      {icon}
    </motion.div>
  );
}
