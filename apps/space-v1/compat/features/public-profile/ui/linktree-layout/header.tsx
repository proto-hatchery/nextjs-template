import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";

import type { LinktreeLayoutMode, LinktreeLayoutTheme } from "./types";

interface LinktreeHeaderProps {
  avatarUrl?: string;
  displayName: string;
  subtitle?: string;
  mode: LinktreeLayoutMode;
  theme?: LinktreeLayoutTheme;
  className?: string;
  headerSlot?: ReactNode;
  hideCover?: boolean;
}

const getRoundedClass = (rounded: LinktreeLayoutTheme["rounded"]) => {
  if (rounded === "none") return "rounded-none";
  if (rounded === "xs") return "rounded-sm";
  if (rounded === "sm") return "rounded-md";
  if (rounded === "md") return "rounded-lg";
  if (rounded === "xl") return "rounded-xl";
  return "rounded-full";
};

export function LinktreeHeader({
  avatarUrl,
  displayName,
  subtitle,
  mode,
  theme,
  className,
  headerSlot,
  hideCover = false,
}: LinktreeHeaderProps) {
  const isProfile = mode === "profile";
  const safeDisplayName = displayName.trim() || "Seu Nome";
  const initials = safeDisplayName.substring(0, 2).toUpperCase();

  const avatarRounded = "rounded-full";
  const avatarSizeClass = isProfile ? "h-28 w-28" : "h-24 w-24";
  const avatarShadowClass = isProfile ? "h-[132px] w-[132px]" : "h-[112px] w-[112px]";
  const showAvatarShadow = !hideCover;

  const fallbackStyle =
    mode === "linktree"
      ? {
          background: theme?.colors.surfaceMuted ?? "#F4F4F1",
          color: theme?.colors.foreground ?? "#0F0F0F",
        }
      : undefined;

  return (
    <header className={cn("flex flex-col items-center", className)}>
      <div
        className={cn(
          "relative flex w-full items-center justify-center",
          hideCover ? "h-auto" : isProfile ? "h-28" : "h-32",
        )}
      >
        {showAvatarShadow ? (
          <div
            className={cn(
              "absolute rounded-full shadow-2xl",
              avatarShadowClass,
              mode === "profile" ? "bg-white" : "bg-[var(--linktree-layout-bg)]",
            )}
          />
        ) : null}

        <Avatar
          className={cn(
            "relative z-10 overflow-hidden shadow-sm",
            avatarSizeClass,
            avatarRounded,
            isProfile ? "border-4 border-white" : "border-none",
          )}
        >
          <AvatarImage src={avatarUrl} alt={safeDisplayName} className="object-cover" />
          <AvatarFallback
            className={cn(
              "font-semibold uppercase",
              avatarRounded,
              isProfile ? "text-3xl bg-zinc-100 text-zinc-700" : "text-xl font-bold",
            )}
            style={fallbackStyle}
          >
            {initials || "PS"}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="w-full text-center -mt-1 pt-1">
        <h1
          className={cn(
            "font-bold tracking-tight",
            isProfile ? "text-2xl text-zinc-900" : "text-2xl",
          )}
        >
          {safeDisplayName}
        </h1>

        {subtitle ? (
          <p
            className={cn(
              isProfile
                ? "mt-1 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500"
                : "mb-1 mt-1 line-clamp-3 text-sm font-medium opacity-70",
            )}
          >
            {subtitle}
          </p>
        ) : null}

        {headerSlot ? (
          <div className={cn(isProfile ? "mt-4 text-zinc-600" : "pt-3 opacity-70")}>
            {headerSlot}
          </div>
        ) : null}
      </div>
    </header>
  );
}
