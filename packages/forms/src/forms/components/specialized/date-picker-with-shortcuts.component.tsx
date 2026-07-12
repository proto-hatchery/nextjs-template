"use client";

import { Button } from "@workspace/ui/components/button";
import { format, isValid, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";

export interface DateShortcut {
  label: string;
  days: number;
}

export interface DatePickerWithShortcutsProps {
  label?: string;
  value?: string; // YYYY-MM-DD format
  onChange?: (value: string) => void; // Returns YYYY-MM-DD format
  onBlur?: () => void;
  placeholder?: string;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
  shortcuts?: DateShortcut[];
  className?: string;
  containerClassName?: string;
  id?: string;
  name?: string;
  "aria-invalid"?: boolean;
}

export function DatePickerWithShortcuts({
  label,
  value,
  onChange,
  onBlur,
  placeholder = "DD/MM/AAAA",
  errorMessage,
  disabled = false,
  required = false,
  shortcuts = [
    { label: "Hoje", days: 0 },
    { label: "3D", days: 3 },
    { label: "7D", days: 7 },
  ],
  className,
  containerClassName,
  id,
  name,
  "aria-invalid": ariaInvalid,
}: DatePickerWithShortcutsProps) {
  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const displayValue = value ? format(parseISO(value), "dd/MM/yyyy") : "";

  const [inputValue, setInputValue] = useState(displayValue);

  // Sync input value when value prop changes (e.g., from shortcuts)
  useEffect(() => {
    const newDisplayValue = value ? format(parseISO(value), "dd/MM/yyyy") : "";
    setInputValue(newDisplayValue);
  }, [value]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);

    // Apply mask
    if (v.length >= 5) {
      v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length >= 3) {
      v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }

    // Update input value immediately for visual feedback
    setInputValue(v);

    // If valid date, update form value as YYYY-MM-DD
    if (v.length === 10) {
      const [day, month, year] = v.split("/");
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      if (isValid(date)) {
        onChange?.(format(date, "yyyy-MM-dd"));
      }
    } else if (v === "") {
      onChange?.("");
    }
  };

  const handleShortcutClick = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const formattedDate = format(date, "yyyy-MM-dd");
    onChange?.(formattedDate);
  };

  const hasError = Boolean(errorMessage || ariaInvalid);

  return (
    <Field data-invalid={hasError} className={containerClassName}>
      {label && (
        <FieldLabel htmlFor={id} aria-required={required}>
          {label}
        </FieldLabel>
      )}
      <div className="relative w-full">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleDateChange}
          onBlur={onBlur}
          maxLength={10}
          name={name}
          id={id}
          disabled={disabled}
          aria-invalid={hasError}
          aria-required={required}
          className={cn("h-10 bg-input border-none pr-20", hasError && "aria-invalid", className)}
        />
        {shortcuts.length > 0 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
            {shortcuts.map((shortcut) => (
              <Button
                key={shortcut.label}
                type="button"
                onClick={() => handleShortcutClick(shortcut.days)}
                disabled={disabled}
                className="text-xs font-semibold text-muted-foreground/70 hover:text-foreground transition-colors px-1 py-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {shortcut.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
}
