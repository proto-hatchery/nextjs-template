"use client";

import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { useMediaQuery } from "../../hooks/use-media-query.hook";
import { cn } from "@workspace/ui/lib/utils";

export interface FilterHeaderLayoutProps {
  leftSection?: React.ReactNode;

  filterSection: React.ReactNode;

  rightSection?: React.ReactNode;

  resultsCount?: number;
  resultsLabelSingular?: string;
  resultsLabelPlural?: string;

  className?: string;

  mobileBreakpoint?: number;
}

function formatResultsLabel(count: number, singular?: string, plural?: string): string {
  if (!singular || !plural) return "";
  return count === 1 ? singular : plural;
}

export function FilterHeaderLayout({
  leftSection,
  filterSection,
  rightSection,
  resultsCount,
  resultsLabelSingular,
  resultsLabelPlural,
  className,
  mobileBreakpoint = 839,
}: FilterHeaderLayoutProps) {
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);

  const resultsText =
    resultsCount !== undefined
      ? `${resultsCount} ${formatResultsLabel(resultsCount, resultsLabelSingular, resultsLabelPlural)}`
      : undefined;

  return (
    <div className={cn("overflow-x-hidden w-full", className)}>
      {isMobile ? (
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-3 min-w-0 w-full h-10">
            {leftSection && (
              <>
                <div className="shrink-0">{leftSection}</div>
                <Separator orientation="vertical" className="h-8" />
              </>
            )}

            <ScrollArea className="flex-1 min-w-0">
              <div className="flex items-center gap-2 pb-1 whitespace-nowrap">{filterSection}</div>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>

            {rightSection && <Separator orientation="vertical" className="h-8" />}
          </div>

          <div className="flex items-center justify-between">
            {resultsText && <p className="text-sm text-muted-foreground">{resultsText}</p>}
            {rightSection && <div className="shrink-0">{rightSection}</div>}
          </div>
        </div>
      ) : (
        <div className="overflow-x-hidden w-full">
          <div className="flex items-center gap-3 min-w-0 w-full h-10">
            {leftSection && (
              <>
                <div className="shrink-0">{leftSection}</div>
                <Separator orientation="vertical" className="h-8" />
              </>
            )}

            <div className="flex-1 min-w-0">
              <ScrollArea className="w-full">
                <div className="flex items-center space-x-2">{filterSection}</div>
                <ScrollBar orientation="horizontal" className="hidden" />
              </ScrollArea>
            </div>

            {!rightSection && resultsText && (
              <>
                <Separator orientation="vertical" className="h-8" />
                <p className="text-sm text-muted-foreground whitespace-nowrap shrink-0">
                  {resultsText}
                </p>
              </>
            )}

            {rightSection && (
              <>
                <Separator orientation="vertical" className="h-8" />
                <div className="shrink-0">{rightSection}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
