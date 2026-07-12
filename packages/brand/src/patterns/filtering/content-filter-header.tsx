"use client";

import { Search, X } from "lucide-react";
import type React from "react";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { FilterHeaderLayout } from "./filter-header-layout";

export interface ContentFilterHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: React.ReactNode;
  rightSection?: React.ReactNode;
  resultsCount?: number;
  resultsLabelSingular?: string;
  resultsLabelPlural?: string;
  className?: string;
}

export function ContentFilterHeader({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters,
  rightSection,
  resultsCount,
  resultsLabelSingular,
  resultsLabelPlural,
  className,
}: ContentFilterHeaderProps) {
  const showClear = searchValue.length > 0;

  return (
    <FilterHeaderLayout
      leftSection={
        <div className="relative w-full sm:w-[260px]">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          {showClear && (
            <BrandButton
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              onClick={() => onSearchChange("")}
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </BrandButton>
          )}
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className={cn("h-10 w-full rounded-lg pl-9 pr-9 text-sm", showClear && "pr-12")}
          />
        </div>
      }
      filterSection={filters}
      rightSection={rightSection}
      {...(resultsCount !== undefined ? { resultsCount } : {})}
      {...(resultsLabelSingular !== undefined ? { resultsLabelSingular } : {})}
      {...(resultsLabelPlural !== undefined ? { resultsLabelPlural } : {})}
      {...(className !== undefined ? { className } : {})}
    />
  );
}
