import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

interface PageContentProps {
  children: ReactNode;
  className?: string;
  withPadding?: boolean;
  paddingSize?: "sm" | "md" | "lg" | "xl";
  scrollX?: boolean;
  scrollY?: boolean;
  hideScrollbar?: boolean;
}

const PADDING_SIZES = {
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

export function PageContent({
  children,
  className,
  withPadding = true,
  paddingSize = "md",
  scrollX = false,
  scrollY = true,
  hideScrollbar = true,
}: PageContentProps) {
  return (
    <div
      className={cn(
        "flex-1 min-h-0",
        scrollX ? "overflow-x-auto" : "overflow-x-hidden",
        scrollY ? "overflow-y-auto" : "overflow-y-hidden",
        hideScrollbar && "scrollbar-hide",
        withPadding && PADDING_SIZES[paddingSize],
        className,
      )}
    >
      {children}
    </div>
  );
}
