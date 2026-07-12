import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

interface PageSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  withPadding?: boolean;
  paddingSize?: "sm" | "md" | "lg" | "xl";
  shrink?: boolean;
}

const PADDING_SIZES = {
  sm: "py-2",
  md: "py-4",
  lg: "py-6",
  xl: "py-8",
};

export function PageSection({
  children,
  className,
  id,
  withPadding = true,
  paddingSize = "md",
  shrink = false,
}: PageSectionProps) {
  return (
    <div
      id={id}
      className={cn(
        "w-full max-w-[1400px]",
        "mx-auto xl:mx-0 xl:ml-0",
        "px-4 sm:px-6 lg:px-8",
        withPadding && PADDING_SIZES[paddingSize],
        shrink && "shrink-0",
        "box-border",
        className,
      )}
    >
      {children}
    </div>
  );
}
