"use client";

import { useEffect, useRef, useState } from "react";

import { FilterPill } from "./filter-pill";
import type { ActiveFilter, FilterDefinition } from "./types";
import { FILTER_DEFINITIONS } from "./types";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";

interface FiltersBarProps {
  onFiltersChange: (filters: ActiveFilter[]) => void;
  definitions?: FilterDefinition[];
}

export function FiltersBar({ onFiltersChange, definitions }: FiltersBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [openPillType, setOpenPillType] = useState<string | null>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const filterDefinitions = definitions ?? FILTER_DEFINITIONS;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (pillsRef.current && !pillsRef.current.contains(target)) {
        setActiveFilters((prev) => {
          if (!openPillType) return prev;
          const activeFilter = prev.find((filter) => filter.type === openPillType);
          if (activeFilter?.selectedOptionIds.length === 0) {
            return prev.filter((filter) => filter.type !== openPillType);
          }
          return prev;
        });
        setOpenPillType(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPillType, setActiveFilters]);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(activeFilters);
  }, [activeFilters, onFiltersChange]);

  useEffect(() => {
    if (openPillType === null) {
      setActiveFilters((prev) => prev.filter((filter) => filter.selectedOptionIds.length > 0));
    }
  }, [openPillType]);

  const handleFilterTypeClick = (definition: FilterDefinition) => {
    const existingFilter = activeFilters.find((f) => f.type === definition.type);

    if (existingFilter) {
      // Open existing pill's popover
      setOpenPillType(definition.type);
    } else {
      // Create new filter and open its popover
      const newFilter: ActiveFilter = {
        type: definition.type,
        selectedOptionIds: [],
      };
      setActiveFilters([...activeFilters, newFilter]);
      setOpenPillType(definition.type);
    }

    setIsDropdownOpen(false);
  };

  const handleFilterUpdate = (type: string, selectedOptionIds: string[]) => {
    setActiveFilters((prev) =>
      prev.map((filter) => (filter.type === type ? { ...filter, selectedOptionIds } : filter)),
    );
  };

  const handleFilterRemove = (type: string) => {
    setActiveFilters((prev) => prev.filter((filter) => filter.type !== type));
    if (openPillType === type) {
      setOpenPillType(null);
    }
  };

  const _handleClearAll = () => {
    setActiveFilters([]);
    setOpenPillType(null);
  };

  const _handlePillOpenChange = (type: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenPillType(type);
    } else if (openPillType === type) {
      setOpenPillType(null);
    }
  };

  const _handlePillClick = (type: string) => {
    setOpenPillType(openPillType === type ? null : type);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Active Pills */}
      <div ref={pillsRef} className="flex items-center gap-3">
        {activeFilters.map((activeFilter) => {
          const definition = filterDefinitions.find((d) => d.type === activeFilter.type);
          if (!definition) return null;

          return (
            <FilterPill
              key={activeFilter.type}
              definition={definition}
              activeFilter={activeFilter}
              onUpdate={handleFilterUpdate}
              onRemove={handleFilterRemove}
              shouldOpen={openPillType === activeFilter.type}
            />
          );
        })}
      </div>

      {/* Filters Button */}
      <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <PopoverTrigger className="h-10 px-5 flex items-center gap-2 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors active:scale-95 whitespace-nowrap">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <span className="text-[13px] font-bold">Filtros</span>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={8}
          className="w-72 overflow-hidden dark backdrop-blur-lg backdrop-saturate-150 bg-[rgba(0,0,0,0.65)] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] text-white rounded-3xl p-0 z-[1200]"
        >
          <div className="p-1.5">
            <div className="flex flex-col">
              <div className="px-4 py-2 mt-1">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                  Categoria
                </span>
              </div>
              {filterDefinitions.map((definition) => {
                const isActive = activeFilters.some((f) => f.type === definition.type);
                return (
                  <button
                    key={definition.type}
                    onClick={() => handleFilterTypeClick(definition)}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-2xl flex items-center justify-between group transition-colors"
                  >
                    <span
                      className={`text-[14px] font-bold ${isActive ? "text-white" : "text-zinc-300"}`}
                    >
                      {definition.label}
                    </span>
                    <svg
                      className="w-4 h-4 text-zinc-500 group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear All Button removed */}
    </div>
  );
}
