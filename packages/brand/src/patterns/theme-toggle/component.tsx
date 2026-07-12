"use client";

import { Monitor as ComputerDesktopIcon, Moon as MoonIcon, Sun as SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { cn } from "@workspace/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";

const THEME_OPTIONS = [
  {
    value: "light",
    label: "Claro",
    icon: SunIcon,
  },
  {
    value: "dark",
    label: "Escuro",
    icon: MoonIcon,
  },
  {
    value: "system",
    label: "Sistema",
    icon: ComputerDesktopIcon,
  },
] as const;

export type ThemeToggleSize = "sm" | "default" | "lg";
export type ThemeToggleVariant = "button" | "dropdown";

export interface ThemeToggleProps {
  variant?: ThemeToggleVariant;
  size?: ThemeToggleSize;
  className?: string;
}

export function ThemeToggle({
  variant = "dropdown",
  size = "default",
  className,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = THEME_OPTIONS.find((option) => option.value === theme) || THEME_OPTIONS[0];
  const CurrentIcon = currentTheme.icon;

  if (variant === "button") {
    const handleToggle = () => {
      if (resolvedTheme === "dark") {
        setTheme("light");
      } else {
        setTheme("dark");
      }
    };

    return (
      <BrandButton
        variant="ghost"
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "icon"}
        onClick={handleToggle}
        className={cn("cursor-pointer", className)}
        aria-label={`Alternar para tema ${resolvedTheme === "dark" ? "claro" : "escuro"}`}
      >
        <CurrentIcon className="size-4" />
      </BrandButton>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <BrandButton
          variant="ghost"
          size={size === "sm" ? "sm" : size === "lg" ? "lg" : "icon"}
          className={cn("cursor-pointer", className)}
          aria-label="Selecionar tema"
        >
          <CurrentIcon className="size-4" />
        </BrandButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40">
        <div className="flex flex-col gap-1">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <BrandButton
                key={option.value}
                variant={isSelected ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTheme(option.value)}
                className="flex justify-start gap-2"
              >
                <Icon className="size-4" />
                <span className="flex-1">{option.label}</span>
                {isSelected && (
                  <div
                    className="bg-primary size-2 flex-shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </BrandButton>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ThemeToggle;
