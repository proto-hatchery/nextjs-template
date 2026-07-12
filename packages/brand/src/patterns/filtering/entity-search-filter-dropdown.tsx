"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { Popover, PopoverTrigger } from "@workspace/ui/components/popover";
import { Separator } from "@workspace/ui/components/separator";
import { FilterPillButton } from "./filter-pill-button";
import { GlassPopoverContent } from "./glass-popover-content";
import { ModernCheckbox } from "./modern-checkbox";

export interface EntitySearchFilterDropdownProps<T> {
  label: string;

  selectedIds: string[];

  onSelectionChange: (ids: string[]) => void;
  onClear: () => void;

  searchPlaceholder: string;
  useSearchHook: (
    searchTerm: string,
    isOpen: boolean,
  ) => {
    data?: T[];
    isPending: boolean;
  };

  getItemId: (item: T) => string;
  getItemDisplayName: (item: T) => string;

  loadingText?: string;
  emptyText?: string;
}

export function EntitySearchFilterDropdown<T>({
  label,
  selectedIds,
  onSelectionChange,

  onClear: _onClear,
  searchPlaceholder,
  useSearchHook,
  getItemId,
  getItemDisplayName,
  loadingText = "Carregando...",
  emptyText = "Nenhum item encontrado",
}: EntitySearchFilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: items, isPending } = useSearchHook(searchTerm, open);

  const [optimisticIds, setOptimisticIds] = useState<string[]>(selectedIds);

  useEffect(() => {
    setOptimisticIds(selectedIds);
  }, [selectedIds]);

  const handleToggleItem = (itemId: string) => {
    const newIds = optimisticIds.includes(itemId)
      ? optimisticIds.filter((id) => id !== itemId)
      : [...optimisticIds, itemId];

    setOptimisticIds(newIds);

    onSelectionChange(newIds);
  };

  const hasSelection = optimisticIds.length > 0;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => optimisticIds.includes(getItemId(item)));
  }, [items, optimisticIds, getItemId]);

  const unselectedItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => !optimisticIds.includes(getItemId(item)));
  }, [items, optimisticIds, getItemId]);

  const hasSelectedItems = selectedItems.length > 0;
  const hasUnselectedItems = unselectedItems.length > 0;
  const hasAnyResults = hasSelectedItems || hasUnselectedItems;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div suppressHydrationWarning>
          <FilterPillButton
            label={label}
            count={optimisticIds.length}
            isActive={hasSelection}
            onClick={() => setOpen(!open)}
          />
        </div>
      </PopoverTrigger>
      {mounted && (
        <GlassPopoverContent className="w-[300px] p-0" align="start">
          <Command className="border-none bg-transparent text-white" shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="text-white placeholder:text-white/50 font-medium caret-white **:[[cmdk-input-wrapper]]:border-b-white/10 **:[[cmdk-input-wrapper]]:px-5 **:[[cmdk-input-wrapper]]:py-1 [&_svg]:size-[18px] [&_svg]:text-white"
            />
            <CommandList className="max-h-[300px] overflow-y-auto">
              {!hasAnyResults && !isPending && (
                <CommandEmpty className="text-white/90 text-base font-medium flex items-center justify-center min-h-[300px]">
                  {emptyText}
                </CommandEmpty>
              )}
              {isPending && !hasAnyResults && (
                <CommandEmpty className="text-white/90 text-base font-medium flex items-center justify-center min-h-[300px]">
                  {loadingText}
                </CommandEmpty>
              )}
              {hasSelectedItems && (
                <CommandGroup className="text-white/90">
                  {selectedItems.map((item) => {
                    const itemId = getItemId(item);
                    const displayName = getItemDisplayName(item);

                    return (
                      <CommandItem
                        key={itemId}
                        onSelect={() => handleToggleItem(itemId)}
                        className="flex items-center gap-2 cursor-pointer hover:bg-white/10 text-white"
                      >
                        <ModernCheckbox checked={true} />
                        <span className="text-base font-medium">{displayName}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
              {hasSelectedItems && hasUnselectedItems && <Separator className="bg-white/10 my-1" />}
              {hasUnselectedItems && (
                <CommandGroup className="text-white/90">
                  {unselectedItems.map((item) => {
                    const itemId = getItemId(item);
                    const displayName = getItemDisplayName(item);
                    const isSelected = optimisticIds.includes(itemId);

                    return (
                      <CommandItem
                        key={itemId}
                        onSelect={() => handleToggleItem(itemId)}
                        className="flex items-center gap-2 cursor-pointer hover:bg-white/10 text-white"
                      >
                        <ModernCheckbox checked={isSelected} />
                        <span className="text-base font-medium">{displayName}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </GlassPopoverContent>
      )}
    </Popover>
  );
}
