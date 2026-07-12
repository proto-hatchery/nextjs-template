"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { cn } from "@workspace/ui/lib/utils";

export interface FluriFieldV2DateSegmentedProps {
  label?: string;
  value?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  required?: boolean;
  className?: string;
  endAdornment?: React.ReactNode;
}

const sizeClasses = {
  sm: {
    container: "h-11 rounded-xl px-3",
    label: "text-sm left-3",
    input: "h-8 text-sm",
    valueText: "text-sm",
  },
  md: {
    container: "h-12 rounded-2xl px-4",
    label: "text-base left-4",
    input: "h-9 text-sm",
    valueText: "text-sm",
  },
  lg: {
    container: "h-14 rounded-2xl px-4",
    label: "text-base left-4",
    input: "h-10 text-sm",
    valueText: "text-sm",
  },
} as const;

// Format 2-digit segment when complete (e.g. "9" -> "09", "12" stays "12")
const formatSegment = (val: string): string => {
  if (val.length === 2) {
    const n = Number.parseInt(val, 10);
    if (n >= 1 && n <= 9) return `0${val.charAt(1)}`;
  }
  return val;
};

// Auto-add leading zero for month: 2-9 -> 02-09 (e.g. 3 -> 03)
const maybeLeadZeroMonth = (val: string): string => {
  if (val.length === 1) {
    const n = Number.parseInt(val, 10);
    if (n >= 2 && n <= 9) return `0${val}`;
  }
  return val;
};

// Auto-add leading zero for day: 4-9 -> 04-09 (1,2,3 ambiguous: 01/10-19, 02/20-29, 03/30-31)
const maybeLeadZeroDay = (val: string): string => {
  if (val.length === 1) {
    const n = Number.parseInt(val, 10);
    if (n >= 4 && n <= 9) return `0${val}`;
  }
  return val;
};

const isValidDay = (d: string): boolean => {
  if (d.length < 2) return true;
  const n = Number.parseInt(d, 10);
  return n >= 1 && n <= 31;
};

const isValidMonth = (m: string): boolean => {
  if (m.length < 2) return true;
  const n = Number.parseInt(m, 10);
  return n >= 1 && n <= 12;
};

const isValidYear = (y: string): boolean => {
  if (y.length < 4) return true;
  const n = Number.parseInt(y, 10);
  return n >= 1900 && n <= 2100;
};

const FluriFieldV2DateSegmented = ({
  label = "Data",
  value = "",
  onChange,
  onBlur,
  helperText,
  errorMessage,
  disabled = false,
  size = "md",
  fullWidth = false,
  required = false,
  className,
  endAdornment,
}: FluriFieldV2DateSegmentedProps) => {
  const id = useId();
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastEmittedValueRef = useRef<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Sync from parent value when it changes externally
  useEffect(() => {
    const digits = (value ?? "").replace(/\D/g, "");

    // Ignore the immediate parent echo of our own emission to avoid
    // reparsing ambiguous partial strings (e.g. "2122025") across segments.
    if (lastEmittedValueRef.current !== null && digits === lastEmittedValueRef.current) {
      lastEmittedValueRef.current = null;
      return;
    }
    lastEmittedValueRef.current = null;

    setDay(digits.slice(0, 2));
    setMonth(digits.slice(2, 4));
    setYear(digits.slice(4, 8));
  }, [value]);

  const hasValue = day.length > 0 || month.length > 0 || year.length > 0;
  const shouldFloatLabel = isFocused || hasValue;
  const hasError = Boolean(errorMessage);

  // Handle focus
  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsFocused(true);
  };

  // Handle blur with timeout to prevent flash when switching between inputs
  const handleBlur = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      onBlur?.();
    }, 0);
  };

  // Update parent value - each segment is independent
  const updateValue = (newDay: string, newMonth: string, newYear: string) => {
    setDay(newDay);
    setMonth(newMonth);
    setYear(newYear);
    const combinedValue = newDay + newMonth + newYear;
    lastEmittedValueRef.current = combinedValue;
    const syntheticTarget = { target: { value: combinedValue } };
    const syntheticEvent = syntheticTarget as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Handle segment change - only the edited segment changes
  const handleSegmentChange = (
    segment: "day" | "month" | "year",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = e.target.value.replace(/\D/g, "");

    if (segment === "day") {
      const limited = input.slice(0, 2);
      const newDay = limited.length === 2 ? formatSegment(limited) : maybeLeadZeroDay(limited);
      if (!isValidDay(newDay)) return;
      updateValue(newDay, month, year);
      if (newDay.length === 2) monthRef.current?.focus();
    } else if (segment === "month") {
      const limited = input.slice(0, 2);
      const newMonth = limited.length === 2 ? formatSegment(limited) : maybeLeadZeroMonth(limited);
      if (!isValidMonth(newMonth)) return;
      updateValue(day, newMonth, year);
      if (newMonth.length === 2) yearRef.current?.focus();
    } else if (segment === "year") {
      const limited = input.slice(0, 4);
      const newYear = limited;
      if (!isValidYear(newYear)) return;
      updateValue(day, month, newYear);
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (
    segment: "day" | "month" | "year",
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      const input = e.currentTarget;
      if (input.selectionStart === 0 && input.value === "") {
        if (segment === "month") {
          e.preventDefault();
          dayRef.current?.focus();
        } else if (segment === "year") {
          e.preventDefault();
          monthRef.current?.focus();
        }
      }
    } else if (e.key === "ArrowLeft") {
      const input = e.currentTarget;
      if (input.selectionStart === 0) {
        if (segment === "month") {
          e.preventDefault();
          dayRef.current?.focus();
          dayRef.current?.setSelectionRange(
            dayRef.current.value.length,
            dayRef.current.value.length,
          );
        } else if (segment === "year") {
          e.preventDefault();
          monthRef.current?.focus();
          monthRef.current?.setSelectionRange(
            monthRef.current.value.length,
            monthRef.current.value.length,
          );
        }
      }
    } else if (e.key === "ArrowRight") {
      const input = e.currentTarget;
      if (input.selectionStart === input.value.length) {
        if (segment === "day") {
          e.preventDefault();
          monthRef.current?.focus();
          monthRef.current?.setSelectionRange(0, 0);
        } else if (segment === "month") {
          e.preventDefault();
          yearRef.current?.focus();
          yearRef.current?.setSelectionRange(0, 0);
        }
      }
    }
  };

  return (
    <Field
      data-invalid={hasError}
      data-disabled={disabled}
      data-size={size}
      className={cn(fullWidth ? "w-full" : "max-w-xs", className)}
    >
      <div
        role="presentation"
        tabIndex={-1}
        className={cn(
          "relative flex items-center bg-muted/50 border border-transparent transition-all duration-200 cursor-text",
          hasError && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          sizeClasses[size].container,
          endAdornment && "pr-1",
        )}
        onClick={(e) => {
          if (!disabled && !(e.target instanceof HTMLInputElement)) {
            dayRef.current?.focus();
          }
        }}
        onPointerDownCapture={(e) => {
          if (disabled) return;
          if (
            e.target instanceof HTMLInputElement &&
            [dayRef, monthRef, yearRef].some((r) => r.current === e.target)
          ) {
            e.preventDefault();
            dayRef.current?.focus();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            dayRef.current?.focus();
          }
        }}
      >
        <FieldLabel
          htmlFor={id}
          aria-required={required}
          className={cn(
            "absolute pointer-events-none text-muted-foreground transition-all duration-200 ease-out origin-left z-10 select-none",
            sizeClasses[size].label,
            shouldFloatLabel ? "text-[11px] top-1.5" : "top-1/2 -translate-y-1/2",
            shouldFloatLabel && "text-muted-foreground/80 font-sans font-semibold",
          )}
        >
          {label ?? "\u00A0"}
        </FieldLabel>

        {/* Segmented inputs container */}
        <div
          className={cn(
            "flex flex-1 min-w-0 items-center gap-1",
            shouldFloatLabel ? "mt-5 justify-start" : "mt-0 justify-start",
          )}
        >
          {/* Day input */}
          <input
            ref={dayRef}
            id={id}
            type="text"
            inputMode="numeric"
            value={day}
            onChange={(e) => handleSegmentChange("day", e)}
            onKeyDown={(e) => handleKeyDown("day", e)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            maxLength={2}
            placeholder="dd"
            className={cn(
              "w-6 h-5 text-center rounded border-0 bg-transparent",
              sizeClasses[size].valueText,
              "text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none focus:ring-0 focus:bg-muted",
              "transition-colors duration-150 px-0 py-0",
              disabled && "cursor-not-allowed",
              !shouldFloatLabel && "opacity-0",
            )}
          />

          {/* Separator */}
          <span
            className={cn(
              "text-muted-foreground/50 font-normal",
              sizeClasses[size].valueText,
              !shouldFloatLabel && "opacity-0",
            )}
          >
            /
          </span>

          {/* Month input */}
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            value={month}
            onChange={(e) => handleSegmentChange("month", e)}
            onKeyDown={(e) => handleKeyDown("month", e)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            maxLength={2}
            placeholder="mm"
            className={cn(
              "w-6 h-5 text-center rounded border-0 bg-transparent",
              sizeClasses[size].valueText,
              "text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none focus:ring-0 focus:bg-muted",
              "transition-colors duration-150 px-0 py-0",
              disabled && "cursor-not-allowed",
              !shouldFloatLabel && "opacity-0",
            )}
          />

          {/* Separator */}
          <span
            className={cn(
              "text-muted-foreground/50 font-normal",
              sizeClasses[size].valueText,
              !shouldFloatLabel && "opacity-0",
            )}
          >
            /
          </span>

          {/* Year input */}
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            value={year}
            onChange={(e) => handleSegmentChange("year", e)}
            onKeyDown={(e) => handleKeyDown("year", e)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            maxLength={4}
            placeholder="aaaa"
            className={cn(
              "w-10 h-5 text-center rounded border-0 bg-transparent",
              sizeClasses[size].valueText,
              "text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none focus:ring-0 focus:bg-muted",
              "transition-colors duration-150 px-0 py-0",
              disabled && "cursor-not-allowed",
              !shouldFloatLabel && "opacity-0",
            )}
          />
        </div>

        {endAdornment && (
          <div className="flex shrink-0 items-center self-stretch">{endAdornment}</div>
        )}
      </div>

      {hasError && errorMessage ? (
        <FieldError className="text-xs mt-1">{errorMessage}</FieldError>
      ) : helperText ? (
        <FieldDescription className="text-xs mt-1">{helperText}</FieldDescription>
      ) : null}
    </Field>
  );
};

export { FluriFieldV2DateSegmented };
export default FluriFieldV2DateSegmented;
