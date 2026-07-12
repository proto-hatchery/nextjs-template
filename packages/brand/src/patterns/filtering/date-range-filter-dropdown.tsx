"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverTrigger } from "@workspace/ui/components/popover";
import { FilterPillButton } from "./filter-pill-button";
import { GlassPopoverContent } from "./glass-popover-content";

export interface DateRangeFilterDropdownProps {
  label?: string;
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (startDate?: string, endDate?: string) => void;
  onClear: () => void;
}

export function DateRangeFilterDropdown({
  label = "Período",
  startDate,
  endDate,
  onDateRangeChange,
  onClear,
}: DateRangeFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  });

  const [optimisticDates, setOptimisticDates] = useState({ startDate, endDate });

  useEffect(() => {
    setOptimisticDates({ startDate, endDate });
  }, [startDate, endDate]);

  useEffect(() => {
    if (open) {
      setTempRange({
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
      });
    }
  }, [open, startDate, endDate]);

  const handleRangeSelect = (range: DateRange | undefined) => {
    setTempRange(range);
  };

  const handleSave = () => {
    const start = tempRange?.from
      ? `${format(tempRange.from, "yyyy-MM-dd")}T00:00:00.000Z`
      : undefined;

    const end = tempRange?.to ? `${format(tempRange.to, "yyyy-MM-dd")}T23:59:59.999Z` : undefined;

    // Update optimistic state immediately
    setOptimisticDates({ startDate: start, endDate: end });

    // Update URL in background
    onDateRangeChange(start, end);
    setOpen(false);
  };

  const hasSelection = !!(optimisticDates.startDate || optimisticDates.endDate);
  const count = hasSelection ? 1 : undefined;

  const getDateLabel = () => {
    if (!tempRange?.from) return null;

    const formatDate = (date: Date) => format(date, "d MMM", { locale: ptBR });

    if (!tempRange.to || tempRange.from.getTime() === tempRange.to.getTime()) {
      return formatDate(tempRange.from);
    }

    return `${formatDate(tempRange.from)} - ${formatDate(tempRange.to)}`;
  };

  const dateLabel = getDateLabel();
  const canSave = !!tempRange?.from;
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
            {...(count !== undefined ? { count } : {})}
            isActive={hasSelection}
            onClick={() => setOpen(!open)}
          />
        </div>
      </PopoverTrigger>
      {mounted && (
        <GlassPopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={tempRange}
            onSelect={handleRangeSelect}
            locale={ptBR}
            autoFocus={false}
          />

          <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
            <BrandButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setTempRange(undefined);
                setOptimisticDates({ startDate: undefined, endDate: undefined });
                onClear();
                setOpen(false);
              }}
              className="text-muted-foreground hover:text-white h-8 px-2 mr-auto"
            >
              Limpar
            </BrandButton>
            <div className="flex items-center gap-3">
              {dateLabel && <span className="text-sm font-medium text-white/90">{dateLabel}</span>}
              <BrandButton
                size="sm"
                onClick={handleSave}
                disabled={!canSave}
                className="bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar
              </BrandButton>
            </div>
          </div>
        </GlassPopoverContent>
      )}
    </Popover>
  );
}
