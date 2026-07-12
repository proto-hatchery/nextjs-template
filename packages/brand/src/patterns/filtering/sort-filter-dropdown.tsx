"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Popover, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { GlassPopoverContent } from "./glass-popover-content";

export interface SortOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SortFilterDropdownProps<T extends string = string> {
  defaultLabel?: string;
  selectedSort?: T;
  sortOptions: SortOption<T>[];
  onSortChange: (sort?: T) => void;
}

export function SortFilterDropdown<T extends string = string>({
  defaultLabel = "Ordenar",
  selectedSort,
  sortOptions,
  onSortChange,
}: SortFilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSortChange = (value: T) => {
    onSortChange(value);
    setOpen(false);
  };

  const selectedLabel =
    sortOptions.find((opt) => opt.value === selectedSort)?.label || defaultLabel;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div suppressHydrationWarning>
          <BrandButton
            variant="ghost"
            style={{ padding: 0 }}
            className={cn(
              "gap-2 p-0 text-black dark:text-white transition-all cursor-pointer",
              "text-base font-semibold hover:bg-transparent h-auto",
            )}
          >
            <span>{selectedLabel}</span>
            <ChevronDown
              className={cn("w-5 h-5 transition-transform duration-200", open && "rotate-180")}
              strokeWidth={3.5}
              strokeLinecap="square"
            />
          </BrandButton>
        </div>
      </PopoverTrigger>
      {mounted && (
        <GlassPopoverContent className="w-[240px] p-0" align="end">
          <div className="p-2">
            {sortOptions.map((option) => {
              const isSelected = selectedSort === option.value;

              return (
                <BrandButton
                  key={option.value}
                  type="button"
                  variant="ghost"
                  onClick={() => handleSortChange(option.value)}
                  className={cn(
                    "flex items-center justify-between gap-3 cursor-pointer hover:bg-white/10 rounded-sm px-3 py-2 transition-all w-full h-auto text-white hover:text-white",
                  )}
                >
                  <span className="text-base flex-1 text-left">{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </BrandButton>
              );
            })}
          </div>
        </GlassPopoverContent>
      )}
    </Popover>
  );
}
