"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { cn } from "@workspace/ui/lib/utils";

export interface FluriFieldV2TimeSegmentedProps {
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

const formatSegment = (val: string): string => {
  if (val.length === 2) {
    const n = Number.parseInt(val, 10);
    if (n >= 1 && n <= 9) return `0${val.charAt(1)}`;
  }
  return val;
};

// Auto-add leading zero for hours: 3-9 -> 03-09 (0,1,2 ambiguous: 00/01/10-19/20-23)
const maybeLeadZeroHours = (val: string): string => {
  if (val.length === 1) {
    const n = Number.parseInt(val, 10);
    if (n >= 3 && n <= 9) return `0${val}`;
  }
  return val;
};

// Auto-add leading zero for minutes: 6-9 -> 06-09 (0-5 ambiguous: 00-09/10-19/.../50-59)
const maybeLeadZeroMinutes = (val: string): string => {
  if (val.length === 1) {
    const n = Number.parseInt(val, 10);
    if (n >= 6 && n <= 9) return `0${val}`;
  }
  return val;
};

const isValidHours = (h: string): boolean => {
  if (h.length < 2) return true;
  const n = Number.parseInt(h, 10);
  return n >= 0 && n <= 23;
};

const isValidMinutes = (m: string): boolean => {
  if (m.length < 2) return true;
  const n = Number.parseInt(m, 10);
  return n >= 0 && n <= 59;
};

const FluriFieldV2TimeSegmented = ({
  label = "Horário",
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
}: FluriFieldV2TimeSegmentedProps) => {
  const id = useId();
  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastEmittedValueRef = useRef<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  // Sync from parent value when it changes externally
  useEffect(() => {
    const digits = (value ?? "").replace(/\D/g, "");

    // Ignore immediate parent echo of local emission to keep segments independent
    // when partial values are ambiguous (e.g. "130" could be 1|30 or 13|0).
    if (lastEmittedValueRef.current !== null && digits === lastEmittedValueRef.current) {
      lastEmittedValueRef.current = null;
      return;
    }
    lastEmittedValueRef.current = null;

    setHours(digits.slice(0, 2));
    setMinutes(digits.slice(2, 4));
  }, [value]);

  const hasValue = hours.length > 0 || minutes.length > 0;
  const shouldFloatLabel = isFocused || hasValue;
  const hasError = Boolean(errorMessage);

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      onBlur?.();
    }, 0);
  };

  const updateValue = (newHours: string, newMinutes: string) => {
    setHours(newHours);
    setMinutes(newMinutes);
    const combinedValue = newHours + newMinutes;
    lastEmittedValueRef.current = combinedValue;
    const syntheticTarget = { target: { value: combinedValue } };
    const syntheticEvent = syntheticTarget as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Handle segment change - only the edited segment changes
  const handleSegmentChange = (
    segment: "hours" | "minutes",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = e.target.value.replace(/\D/g, "");

    if (segment === "hours") {
      const limited = input.slice(0, 2);
      const newHours = limited.length === 2 ? formatSegment(limited) : maybeLeadZeroHours(limited);
      if (!isValidHours(newHours)) return;
      updateValue(newHours, minutes);
      if (newHours.length === 2) minutesRef.current?.focus();
    } else if (segment === "minutes") {
      const limited = input.slice(0, 2);
      const newMinutes =
        limited.length === 2 ? formatSegment(limited) : maybeLeadZeroMinutes(limited);
      if (!isValidMinutes(newMinutes)) return;
      updateValue(hours, newMinutes);
    }
  };

  const handleKeyDown = (
    segment: "hours" | "minutes",
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      const input = e.currentTarget;
      if (input.selectionStart === 0 && input.value === "") {
        if (segment === "minutes") {
          e.preventDefault();
          hoursRef.current?.focus();
        }
      }
    } else if (e.key === "ArrowLeft") {
      const input = e.currentTarget;
      if (input.selectionStart === 0) {
        if (segment === "minutes") {
          e.preventDefault();
          hoursRef.current?.focus();
          hoursRef.current?.setSelectionRange(
            hoursRef.current.value.length,
            hoursRef.current.value.length,
          );
        }
      }
    } else if (e.key === "ArrowRight") {
      const input = e.currentTarget;
      if (input.selectionStart === input.value.length) {
        if (segment === "hours") {
          e.preventDefault();
          minutesRef.current?.focus();
          minutesRef.current?.setSelectionRange(0, 0);
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
        )}
        onClick={(e) => {
          if (!disabled && !(e.target instanceof HTMLInputElement)) {
            hoursRef.current?.focus();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            hoursRef.current?.focus();
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

        <div
          className={cn(
            "flex flex-1 min-w-0 items-center gap-1",
            shouldFloatLabel ? "mt-5 justify-start" : "mt-0 justify-start",
          )}
        >
          <input
            ref={hoursRef}
            id={id}
            type="text"
            inputMode="numeric"
            value={hours}
            onChange={(e) => handleSegmentChange("hours", e)}
            onKeyDown={(e) => handleKeyDown("hours", e)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            maxLength={2}
            placeholder="hh"
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

          <span
            className={cn(
              "text-muted-foreground/50 font-normal",
              sizeClasses[size].valueText,
              !shouldFloatLabel && "opacity-0",
            )}
          >
            :
          </span>

          <input
            ref={minutesRef}
            type="text"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => handleSegmentChange("minutes", e)}
            onKeyDown={(e) => handleKeyDown("minutes", e)}
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
        </div>
      </div>

      {hasError && errorMessage ? (
        <FieldError className="text-xs mt-1">{errorMessage}</FieldError>
      ) : helperText ? (
        <FieldDescription className="text-xs mt-1">{helperText}</FieldDescription>
      ) : null}
    </Field>
  );
};

export { FluriFieldV2TimeSegmented };
export default FluriFieldV2TimeSegmented;
