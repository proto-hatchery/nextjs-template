import { cn } from "@workspace/ui/lib/utils";
import type React from "react";
import type { ReactNode } from "react";

interface PageSectionFullBleedProps {
  children: ReactNode;
  className?: string;
  id?: string;
  sticky?: boolean;
  stickyPosition?: "top" | "bottom";
  stickyOffset?: number;
  withBackdropBlur?: boolean;
  shrink?: boolean;
  style?: React.CSSProperties;
}

export function PageSectionFullBleed({
  children,
  className,
  id,
  sticky = false,
  stickyPosition = "top",
  stickyOffset = 0,
  withBackdropBlur = false,
  shrink = false,
  style,
}: PageSectionFullBleedProps) {
  const stickyStyle =
    sticky && stickyPosition === "top"
      ? { top: stickyOffset, ...style }
      : sticky && stickyPosition === "bottom"
        ? { bottom: stickyOffset, ...style }
        : style;

  return (
    <div
      id={id}
      className={cn(
        "w-full",
        shrink && "shrink-0",
        sticky && "sticky z-10",
        sticky && stickyPosition === "top" && "top-0",
        sticky && stickyPosition === "bottom" && "bottom-0",
        withBackdropBlur && "backdrop-blur supports-backdrop-filter:bg-background/60",
        className,
      )}
      style={stickyStyle}
    >
      {children}
    </div>
  );
}
