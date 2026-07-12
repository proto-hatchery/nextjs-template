import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import type { ComponentProps, ReactNode } from "react";

export interface HeaderAction extends ComponentProps<"button"> {
  label: string;
  key: string;
  variant?: "default" | "neutral" | "destructive" | "secondary" | "ghost" | "link";
}

interface PageContentHeaderProps {
  breadcrumbs?: ReactNode;
  actions?: HeaderAction[] | ReactNode;
  children: ReactNode;
  className?: string;
  /**
   * Optional second row for filters or other controls.
   * Renders below the main header row.
   */
  extension?: ReactNode;
}

export function PageContentHeader({
  breadcrumbs,
  actions,
  children,
  className,
  extension,
}: PageContentHeaderProps) {
  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Header Section - Fixed at top - Hidden on mobile, visible on desktop */}
      <header className="hidden md:block shrink-0 bg-background">
        <div className={cn("flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4")}>
          {/* Breadcrumbs Area */}
          <div className="flex items-center min-w-0 flex-1">{breadcrumbs}</div>

          {/* Actions Area */}
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {Array.isArray(actions)
                ? actions.map(({ key, label, ...props }) => (
                    <BrandButton key={key} {...props}>
                      {label}
                    </BrandButton>
                  ))
                : actions}
            </div>
          )}
        </div>

        {/* Extension Area (Filters, etc) */}
        {extension && (
          <div className="border-b border-border/50 px-4 sm:px-6 lg:px-8 py-3 bg-muted/5">
            {extension}
          </div>
        )}
      </header>

      {/* Content Section - Takes remaining space, no scroll here */}
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}

export function PageContentWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}
