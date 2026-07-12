"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { useTheme } from "next-themes";

export interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <BrandButton
        variant="ghost"
        size="icon"
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-xl hover:bg-muted transition-colors",
          className,
        )}
        disabled
        aria-label="Alternar tema"
      >
        <Moon className="size-5" />
      </BrandButton>
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <BrandButton
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl hover:bg-muted transition-colors",
        className,
      )}
      aria-label={`Alternar para tema ${isDark ? "claro" : "escuro"}`}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </BrandButton>
  );
}
