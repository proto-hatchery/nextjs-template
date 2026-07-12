"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Image from "next/image";

import { cn } from "@workspace/ui/lib/utils";

import { BallEffect } from "./linktree-layout/ball-effect";
import { LinktreeFooter } from "./linktree-layout/footer";
import { LinktreeHeader } from "./linktree-layout/header";
import type { LinktreeLayoutTheme } from "./linktree-layout/types";

const DEFAULT_LINKTREE_THEME: LinktreeLayoutTheme = {
  id: "classic",
  colors: {
    background: "#F8F8F5",
    foreground: "#0F0F0F",
    surface: "#FFFFFF",
    surfaceMuted: "#F4F4F1",
    border: "#E3E4DD",
    primary: "#121212",
    primaryText: "#FFFFFF",
    secondary: "#FFFFFF",
    secondaryText: "#111111",
    accent: "#C9CBBE",
  },
  rounded: "full",
};

const darkenHex = (hex: string, amount = 0.18) => {
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) return hex;

  const num = parseInt(sanitized, 16);
  const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount));
  const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount));
  const b = Math.max(0, (num & 0xff) * (1 - amount));

  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
};

export interface LinktreeLayoutProps {
  children: ReactNode;
  avatarUrl?: string;
  displayName: string;
  subtitle?: string;
  backgroundImageUrl?: string;
  mode: "linktree" | "profile";
  theme?: LinktreeLayoutTheme;
  profileBackgroundColor?: string;
  profileTextColor?: string;
  className?: string;
  showBallEffect?: boolean;
  headerHeight?: "default" | "tall";
  footer?: ReactNode;
  fixedHeight?: boolean;
  headerSlot?: ReactNode;
  header?: ReactNode;
  hideCover?: boolean;
}

export function LinktreeLayout({
  children,
  avatarUrl,
  displayName,
  subtitle,
  backgroundImageUrl,
  mode,
  theme,
  profileBackgroundColor,
  profileTextColor,
  className,
  showBallEffect = true,
  headerHeight = "default",
  footer,
  fixedHeight = false,
  headerSlot,
  header,
  hideCover = false,
}: LinktreeLayoutProps) {
  const [backgroundImageError, setBackgroundImageError] = React.useState(false);

  const isLinktree = mode === "linktree";
  const resolvedTheme = theme ?? DEFAULT_LINKTREE_THEME;

  const backgroundColor = isLinktree
    ? resolvedTheme.colors.background
    : (profileBackgroundColor ?? "#FFFFFF");
  const foregroundColor = isLinktree
    ? resolvedTheme.colors.foreground
    : (profileTextColor ?? "#18181B");

  const headerHeightClass = headerHeight === "tall" ? "h-[34%]" : "h-[28%]";

  const contentPaddingClass = fixedHeight
    ? "px-6 pt-[env(safe-area-inset-top,6dvh)] pb-[env(safe-area-inset-bottom,4dvh)]"
    : hideCover
      ? "px-6 pt-4 pb-6"
      : "px-6 pt-9 pb-6";

  const headerTopClass = fixedHeight
    ? "pt-[8dvh]"
    : mode === "profile"
      ? "pt-0"
      : hideCover
        ? "pt-0"
        : "pt-1";

  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden",
        fixedHeight ? "h-[100dvh] overscroll-none touch-none" : "h-full",
        className,
      )}
      style={{
        background: backgroundColor,
        color: foregroundColor,
        borderColor: isLinktree ? resolvedTheme.colors.border : undefined,
        ["--linktree-layout-bg" as string]: backgroundColor,
      }}
    >
      {!hideCover && (
        <div
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-0 w-full overflow-hidden shrink-0",
            headerHeightClass,
          )}
        >
          {backgroundImageUrl && !backgroundImageError ? (
            <div className="absolute inset-0">
              <Image
                src={backgroundImageUrl}
                alt="Header background"
                fill
                className="object-cover"
                onError={() => setBackgroundImageError(true)}
              />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-b to-transparent",
                  mode === "profile" ? "from-black/25" : "from-black/20",
                )}
              />
            </div>
          ) : (
            <div className="absolute inset-0">
              <div
                className="absolute inset-0"
                style={{
                  background: isLinktree
                    ? darkenHex(resolvedTheme.colors.accent, 0.18)
                    : "linear-gradient(to bottom right, #18181b, #3f3f46, #a1a1aa)",
                }}
              />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-b to-transparent",
                  mode === "profile" ? "from-black/20" : "from-black/10",
                )}
              />
            </div>
          )}

          {showBallEffect ? (
            <BallEffect
              backgroundColor={isLinktree ? resolvedTheme.colors.background : "#FFFFFF"}
            />
          ) : null}
        </div>
      )}

      <div
        className={cn(
          "relative z-20 flex h-full w-full flex-col overflow-y-auto no-scrollbar",
          contentPaddingClass,
        )}
      >
        <div className="shrink-0">
          {header ? (
            header
          ) : (
            <LinktreeHeader
              {...(avatarUrl !== undefined ? { avatarUrl } : {})}
              displayName={displayName}
              {...(subtitle !== undefined ? { subtitle } : {})}
              mode={mode}
              theme={resolvedTheme}
              className={cn(headerTopClass)}
              {...(headerSlot !== undefined ? { headerSlot } : {})}
              hideCover={hideCover}
            />
          )}
        </div>

        <main className="flex flex-1 flex-col shrink-0 mt-2">{children}</main>

        <div className="mt-auto shrink-0 pt-6">
          <LinktreeFooter mode={mode} theme={resolvedTheme}>
            {footer}
          </LinktreeFooter>
        </div>
      </div>
    </div>
  );
}

export { BallEffect } from "./linktree-layout/ball-effect";
export { LinktreeFooter } from "./linktree-layout/footer";
export { LinktreeHeader } from "./linktree-layout/header";
export type { LinktreeLayoutMode, LinktreeLayoutTheme } from "./linktree-layout/types";
