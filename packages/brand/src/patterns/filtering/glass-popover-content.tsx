"use client";

import type React from "react";
import { PopoverContent } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";

type GlassPopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverContent> & {
  ref?: React.Ref<React.ElementRef<typeof PopoverContent>>;
};

export const GlassPopoverContent = ({
  className,
  children,
  ref,
  ...props
}: GlassPopoverContentProps) => {
  return (
    <PopoverContent
      ref={ref}
      className={cn(
        "dark",

        "backdrop-blur-lg backdrop-saturate-150",

        "bg-black/65",

        "border border-white/10",

        "shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]",

        "text-white",

        "transition-all duration-200",

        className,
      )}
      {...props}
    >
      {children}
    </PopoverContent>
  );
};

GlassPopoverContent.displayName = "GlassPopoverContent";
