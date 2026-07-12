import type { ReactNode } from "react";
import { FluriLogo } from "@workspace/ui/assets";
import { cn } from "@workspace/ui/lib/utils";

import type { LinktreeLayoutMode, LinktreeLayoutTheme } from "./types";

interface LinktreeFooterProps {
  mode: LinktreeLayoutMode;
  theme?: LinktreeLayoutTheme;
  className?: string;
  children?: ReactNode;
}

export function LinktreeFooter({ mode, theme, className, children }: LinktreeFooterProps) {
  if (children) {
    return <footer className={cn("flex flex-col items-center", className)}>{children}</footer>;
  }

  return (
    <footer className={cn("flex flex-col items-center", className)}>
      <div
        className={cn(
          "flex flex-col items-center gap-1.5",
          mode === "profile" ? "opacity-40" : "opacity-60",
        )}
      >
        <span
          className={cn(
            "text-[8px] font-bold uppercase tracking-[0.2em]",
            mode === "profile" ? "text-zinc-500" : "text-muted-foreground",
          )}
          style={mode === "linktree" ? { color: theme?.colors.foreground } : undefined}
        >
          Made with
        </span>
        <div style={{ width: 32, height: 12 }}>
          <FluriLogo
            className={cn(
              "h-full w-full",
              mode === "profile" ? "brightness-0 grayscale" : "grayscale",
            )}
          />
        </div>
      </div>
    </footer>
  );
}
