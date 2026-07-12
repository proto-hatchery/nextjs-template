"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { ActiveFilter, FilterDefinition } from "./types";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";

interface FilterPillProps {
  definition: FilterDefinition;
  activeFilter: ActiveFilter;
  onUpdate: (type: string, selectedOptionIds: string[]) => void;
  onRemove: (type: string) => void;
  shouldOpen: boolean;
}

export function FilterPill({
  definition,
  activeFilter,
  onUpdate,
  onRemove,
  shouldOpen,
}: FilterPillProps) {
  const [isOpen, setIsOpen] = useState(shouldOpen);
  useEffect(() => {
    setIsOpen(shouldOpen);
  }, [shouldOpen]);

  const handleOptionToggle = (optionId: string) => {
    const newSelected = activeFilter.selectedOptionIds.includes(optionId)
      ? activeFilter.selectedOptionIds.filter((id) => id !== optionId)
      : [...activeFilter.selectedOptionIds, optionId];
    onUpdate(definition.type, newSelected);
  };

  const selectedCount = activeFilter.selectedOptionIds.length;
  const label = selectedCount > 0 ? `${definition.label}: ${selectedCount}` : definition.label;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className={`h-10 px-4 flex items-center gap-2 rounded-full border transition-all cursor-pointer
          ${
            isOpen || selectedCount > 0
              ? "bg-zinc-900 text-white border-zinc-900"
              : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
          }`}
      >
        <span className="text-[13px] font-bold whitespace-nowrap">{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />

        {selectedCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(definition.type);
            }}
            className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        className="w-64 bg-white rounded-2xl shadow-xl border border-zinc-100 p-2 z-[1200]"
      >
        <div className="max-h-60 overflow-y-auto p-1">
          {definition.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionToggle(option.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50 rounded-xl transition-colors group"
            >
              <span
                className={`text-sm font-medium ${
                  activeFilter.selectedOptionIds.includes(option.id)
                    ? "text-zinc-900"
                    : "text-zinc-600"
                }`}
              >
                {option.label}
              </span>
              {activeFilter.selectedOptionIds.includes(option.id) && (
                <div className="w-4 h-4 bg-zinc-900 rounded-full flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="4"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
