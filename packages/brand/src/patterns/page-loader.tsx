"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Spinner } from "@workspace/ui/components/spinner";

export interface PageLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Background style */
  background?: "default" | "transparent" | "blur";
  /** Whether to fill the entire screen */
  fullScreen?: boolean;
  /** Optional message to display below spinner */
  message?: string;
  /** Spinner size class (e.g., "size-8", "size-12") */
  spinnerClassName?: string;
}

const backgroundStyles = {
  default: "bg-background",
  transparent: "bg-transparent",
  blur: "bg-background/80 backdrop-blur-sm",
};

/**
 * PageLoader Component
 *
 * A full-page or section loading component for major loading states.
 *
 * @example
 * // Full screen loading
 * if (isLoading) {
 *   return <PageLoader fullScreen message="Carregando..." />;
 * }
 *
 * @example
 * // Section loading
 * <div className="relative min-h-[200px]">
 *   {isLoading && <PageLoader />}
 *   {!isLoading && <Content />}
 * </div>
 */
function PageLoader({
  background = "default",
  fullScreen = false,
  message,
  spinnerClassName = "size-8",
  className,
  ...props
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen ? "fixed inset-0 z-50" : "absolute inset-0",
        backgroundStyles[background],
        className,
      )}
      {...props}
    >
      <Spinner className={cn("text-primary", spinnerClassName)} />
      {message && (
        <p className="text-sm text-muted-foreground font-light animate-pulse">{message}</p>
      )}
    </div>
  );
}

export { PageLoader };
