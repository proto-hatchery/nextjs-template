"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { cn } from "@workspace/ui/lib/utils";

export interface ToggleOption<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

export interface GenericToggleProps<T extends string = string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  compact?: boolean;
  className?: string;
}

export function GenericToggle<T extends string = string>({
  options,
  value,
  onChange,
  compact = false,
  className,
}: GenericToggleProps<T>) {
  const [optimisticValue, setOptimisticValue] = useState(value);
  const [, setHovering] = useState(false);

  useEffect(() => {
    setOptimisticValue(value);
  }, [value]);

  const handleChange = (newValue: T) => {
    setOptimisticValue(newValue);
    onChange(newValue);
  };

  return (
    <div
      className={cn("inline-flex items-center gap-1 rounded-full bg-muted p-1 relative", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = optimisticValue === option.value;

        return (
          <BrandButton
            key={option.value}
            variant="ghost"
            size="sm"
            onClick={() => handleChange(option.value)}
            className={cn(
              "relative rounded-full transition-all text-sm font-semibold",
              compact ? "px-2.5 py-1.5" : "px-4 py-1.5",
              isSelected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            title={compact ? option.label : undefined}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {isSelected && (
              <motion.div
                layoutId="activeToggle"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className="absolute inset-0 bg-background rounded-full shadow-sm"
              />
            )}
            <span className="relative block z-10">
              {compact && Icon ? <Icon className="size-4" /> : option.label}
            </span>
          </BrandButton>
        );
      })}
    </div>
  );
}
