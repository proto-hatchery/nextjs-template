"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface FluriDialogV2OverlayCloseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

const baseButtonClasses =
  "cursor-pointer rounded-full bg-accent p-2.5 transition-colors hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

export function FluriDialogV2OverlayCloseButton({
  onClick,
  disabled,
  className,
  ariaLabel = "Fechar",
}: FluriDialogV2OverlayCloseButtonProps) {
  return (
    <BrandButton
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className={cn(baseButtonClasses, className)}
      aria-label={ariaLabel}
    >
      <X className="h-5 w-5 text-muted-foreground" />
    </BrandButton>
  );
}
