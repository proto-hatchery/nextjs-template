"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { cn } from "@workspace/ui/lib/utils";

export interface FilterPillButtonProps extends Omit<
  React.ComponentProps<typeof BrandButton>,
  "onClick"
> {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}

export function FilterPillButton({
  label,
  count = 0,
  isActive,
  onClick,
  className,
  ...props
}: FilterPillButtonProps) {
  return (
    <BrandButton
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "rounded-full transition-all cursor-pointer gap-2 px-3 h-8",
        // Inactive State
        !isActive &&
          "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
        // Active State
        isActive &&
          "bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-100 dark:hover:bg-blue-900/60",
        // Font size
        "text-sm font-medium",
        className,
      )}
      {...props}
    >
      <span className="truncate max-w-[150px]">{label}</span>

      {isActive && count > 0 && (
        <span
          className={cn(
            "flex items-center justify-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold leading-none",
            "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100",
          )}
        >
          {count}
        </span>
      )}

      <ChevronDown className="size-4 opacity-50" strokeWidth={2} />
    </BrandButton>
  );
}
