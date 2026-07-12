"use client";

import { Button } from "@workspace/ui/components/button";
import { CalendarDate } from "@internationalized/date";
import { Calendar as CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import type { FluriFieldV2DateSegmentedProps } from "./fluri-field-v2-date-segmented.component";
import { FluriFieldV2DateSegmented } from "./fluri-field-v2-date-segmented.component";

const iconSizes: Record<NonNullable<FluriFieldV2DateSegmentedProps["size"]>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

const calendarPopoverStyle: React.CSSProperties = {
  background: [
    "radial-gradient(120% 130% at 6% 0%, color-mix(in oklab, var(--primary) 8%, transparent), transparent 60%)",
    "radial-gradient(130% 120% at 100% 100%, color-mix(in oklab, var(--accent) 8%, transparent), transparent 62%)",
    "color-mix(in oklab, var(--background) 12%, transparent)",
  ].join(", "),
  borderColor: "var(--glass-select-border)",
  boxShadow:
    "0 10px 24px -22px color-mix(in srgb, black 36%, transparent), inset 0 0 0 1px color-mix(in oklab, var(--glass-select-border) 45%, transparent)",
  backdropFilter: "var(--glass-select-backdrop)",
  WebkitBackdropFilter: "var(--glass-select-backdrop)",
};

/** Converte DDMMYYYY (8 dígitos) para CalendarDate */
function digitsToCalendarDate(digits: string): CalendarDate | null {
  if (digits.length !== 8) return null;
  const day = Number.parseInt(digits.slice(0, 2), 10);
  const month = Number.parseInt(digits.slice(2, 4), 10);
  const year = Number.parseInt(digits.slice(4, 8), 10);
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return null;
  return new CalendarDate(year, month, day);
}

/** Converte CalendarDate para DDMMYYYY */
function calendarDateToDigits(date: CalendarDate): string {
  const day = String(date.day).padStart(2, "0");
  const month = String(date.month).padStart(2, "0");
  const year = String(date.year).padStart(4, "0");
  return `${day}${month}${year}`;
}

function calendarDateToDate(date: CalendarDate): Date {
  return new Date(date.year, date.month - 1, date.day);
}

function dateToCalendarDate(date: Date): CalendarDate {
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export type FluriFieldV2DateSegmentedWithPickerProps = Omit<
  FluriFieldV2DateSegmentedProps,
  "endAdornment"
>;

export const FluriFieldV2DateSegmentedWithPicker = ({
  value = "",
  onChange,
  disabled = false,
  size = "md",
  ...props
}: FluriFieldV2DateSegmentedWithPickerProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const digits = value.replace(/\D/g, "");
  const calendarValue = useMemo(() => digitsToCalendarDate(digits), [digits]);

  const handleCalendarChange = (
    date: CalendarDate | { year: number; month: number; day: number } | null,
  ) => {
    if (!date) return;
    const cd =
      date instanceof CalendarDate ? date : new CalendarDate(date.year, date.month, date.day);
    const newDigits = calendarDateToDigits(cd);
    const eventTarget = { target: { value: newDigits } };
    onChange(eventTarget as React.ChangeEvent<HTMLInputElement>);
    setCalendarOpen(false);
  };

  const endAdornment = (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "flex h-full items-center justify-center px-1 text-muted-foreground/80 outline-none transition-colors",
            "hover:text-foreground hover:bg-transparent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:rounded-md",
            disabled && "cursor-not-allowed opacity-50",
            !disabled && "cursor-pointer",
          )}
          aria-label="Abrir calendário"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
        >
          <CalendarIcon size={iconSizes[size]} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        alignOffset={-18}
        side="bottom"
        sideOffset={10}
        collisionPadding={8}
        style={calendarPopoverStyle}
        className={cn(
          "z-[2000] w-auto rounded-xl border bg-transparent p-2 shadow-none",
          "[&_[slot='previous']]:border-0 [&_[slot='previous']]:bg-transparent",
          "[&_[slot='next']]:border-0 [&_[slot='next']]:bg-transparent",
        )}
      >
        {calendarOpen && (
          <Calendar
            mode="single"
            selected={calendarValue ? calendarDateToDate(calendarValue) : undefined}
            onSelect={(date) => {
              if (date) {
                handleCalendarChange(dateToCalendarDate(date));
              }
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );

  return (
    <FluriFieldV2DateSegmented
      value={value}
      onChange={onChange}
      disabled={disabled}
      size={size}
      endAdornment={endAdornment}
      {...props}
    />
  );
};
