import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { Lock } from "lucide-react";

import type { BadgeConfig, BadgeType } from "./types";

interface SidebarBadgeProps {
  type: string;
  text?: string;
  className?: string;
  /** Custom badges configuration to extend default badges */
  customBadges?: Record<string, BadgeConfig>;
}

const defaultBadgeConfig: Record<BadgeType, BadgeConfig> = {
  comingSoon: {
    text: "Em breve",
    className: "bg-muted text-muted-foreground border-0 shadow-none hover:bg-muted",
  },
  new: {
    text: "Novo",
    className: "bg-accent text-accent-foreground border-accent hover:bg-accent",
  },
  beta: {
    text: "Beta",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/10",
  },
  pro: {
    text: "Pro",
    className:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/10",
  },
  lock: {
    text: "",
    className: "bg-transparent text-muted-foreground border-none p-0 h-auto hover:bg-transparent",
  },
};

export function SidebarBadge({ type, text, className, customBadges }: SidebarBadgeProps) {
  // Merge default and custom badges
  const allBadges = { ...defaultBadgeConfig, ...customBadges };
  const config = allBadges[type as BadgeType];

  if (type === "lock") {
    // CHANGED: Added 'group-data-[collapsible=icon]:hidden' to hide lock icon when sidebar is collapsed
    // This prevents the design bug where the lock icon appears next to the icon in collapsed mode
    return (
      <Lock
        className={cn(
          "ml-auto size-3 text-muted-foreground/50 group-data-[collapsible=icon]:hidden",
          className,
        )}
      />
    );
  }

  // If no config found, use a default style
  if (!config) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "ml-auto text-[10px] px-1.5 py-0 h-4 shrink-0 group-data-[collapsible=icon]:hidden pointer-events-none",
          className,
        )}
      >
        {text ?? type}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "ml-auto text-[10px] px-1.5 py-0 h-4 shrink-0 group-data-[collapsible=icon]:hidden pointer-events-none",
        config.className,
        className,
      )}
    >
      {text ?? config.text}
    </Badge>
  );
}

export { defaultBadgeConfig };
