"use client";

import { Label } from "@radix-ui/react-label";
import { useEffect, useState } from "react";
import { Popover, PopoverTrigger } from "@workspace/ui/components/popover";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { FilterPillButton } from "./filter-pill-button";
import { GlassPopoverContent } from "./glass-popover-content";
import { ModernCheckbox } from "./modern-checkbox";

export interface FilterOption {
  value: string;
  label: string;
}

export interface CheckboxFilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  onClear: () => void;
}

export function CheckboxFilterDropdown({
  label,
  options,
  selectedValues,
  onSelectionChange,

  onClear: _onClear,
}: CheckboxFilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const [optimisticValues, setOptimisticValues] = useState<string[]>(selectedValues);

  useEffect(() => {
    setOptimisticValues(selectedValues);
  }, [selectedValues]);

  const handleToggle = (value: string) => {
    const newValues = optimisticValues.includes(value)
      ? optimisticValues.filter((v) => v !== value)
      : [...optimisticValues, value];

    setOptimisticValues(newValues);

    onSelectionChange(newValues);
  };

  const hasSelection = optimisticValues.length > 0;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div suppressHydrationWarning>
          <FilterPillButton
            label={label}
            count={optimisticValues.length}
            isActive={hasSelection}
            onClick={() => setOpen(!open)}
          />
        </div>
      </PopoverTrigger>
      {mounted && (
        <GlassPopoverContent className="w-[280px] p-0" align="start">
          <ScrollArea className="max-h-[300px] **:data-radix-scroll-area-viewport:p-0 **:data-[slot=scroll-area-thumb]:bg-white/20">
            <div className="p-2">
              {options.map((option) => {
                const isSelected = optimisticValues.includes(option.value);

                return (
                  <Label
                    key={option.value}
                    htmlFor={`checkbox-${option.value}`}
                    className="bg-transparent flex items-center gap-3 cursor-pointer hover:bg-white/10 rounded-sm px-3 py-2 transition-all w-full justify-start h-auto text-white hover:text-white"
                  >
                    <ModernCheckbox
                      id={`checkbox-${option.value}`}
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(option.value)}
                    />
                    <span className="text-base flex-1 text-left">{option.label}</span>
                  </Label>
                );
              })}
            </div>
          </ScrollArea>
        </GlassPopoverContent>
      )}
    </Popover>
  );
}
