"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import TextField, { type TextFieldProps } from "@workspace/forms/components/base/text-field.component";

// ============================================================================
// Types
// ============================================================================

export interface CurrencyFieldProps extends Omit<
  TextFieldProps,
  "type" | "value" | "onChange" | "defaultValue"
> {
  ref?: React.Ref<HTMLInputElement>;
  /** Current value - can be string (formatted) or number */
  value?: string | number;
  /** Callback when value changes - receives both formatted string and numeric value */
  onValueChange?: (formatted: string, numeric: number) => void;
  /** Maximum allowed value (numeric, e.g., 5000.00) */
  maxValue?: number;
  /** Optional onChange for compatibility with form libraries */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Default value */
  defaultValue?: string | number;
}

// ============================================================================
// Utilities
// ============================================================================

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// ============================================================================
// Component
// ============================================================================

export const CurrencyField = ({
  value,
  defaultValue,
  onValueChange,
  onChange,
  maxValue,
  onFocus,
  ref,
  ...props
}: CurrencyFieldProps) => {
  const internalInputRef = useRef<HTMLInputElement>(null);
  // Store the raw integer value (e.g. 1234 for R$ 12,34)
  const [rawValue, setRawValue] = useState<number>(0);

  useImperativeHandle(ref, () => internalInputRef.current as HTMLInputElement);

  // Initialize state from props
  useEffect(() => {
    let initialValue = 0;
    const v = value ?? defaultValue;

    if (typeof v === "number") {
      initialValue = Math.round(v * 100);
    } else if (typeof v === "string" && v !== "") {
      // Try to parse string input safely
      try {
        const clean = v.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
        const num = Number.parseFloat(clean);
        if (!Number.isNaN(num)) {
          initialValue = Math.round(num * 100);
        }
      } catch {
        // ignore
      }
    }
    setRawValue(initialValue);
  }, [value, defaultValue]); // Run only on mount/defaultValue change, or if we want to sync with value prop

  // Sync with external value prop if it changes
  useEffect(() => {
    if (value !== undefined) {
      let newValue = 0;
      if (typeof value === "number") {
        newValue = Math.round(value * 100);
      } else if (typeof value === "string" && value !== "") {
        try {
          const clean = value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
          const num = Number.parseFloat(clean);
          if (!Number.isNaN(num)) {
            newValue = Math.round(num * 100);
          }
        } catch {
          // ignore
        }
      }
      setRawValue(newValue);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isDigit = /^\d$/.test(e.key);
    const isBackspace = e.key === "Backspace";
    const isDelete = e.key === "Delete";

    if (isDigit) {
      e.preventDefault();
      const digit = Number.parseInt(e.key, 10);
      const newValue = rawValue * 10 + digit;

      // Check Max Value
      if (maxValue !== undefined && newValue / 100 > maxValue) {
        return;
      }

      updateValue(newValue);
    } else if (isBackspace || isDelete) {
      e.preventDefault();
      const newValue = Math.floor(rawValue / 10);
      updateValue(newValue);
    }
    // Allow navigation keys, tab, etc.
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This handles paste or mobile input where keydown might not trigger correctly for all keys
    // But for the "fixed decimal" logic, intercepting keydown is usually safer for desktop.
    // For mobile, we might need to diff the input.

    // Let's rely on a diffing approach for robustness across devices if keydown didn't preventDefault
    const input = e.target.value;

    // Extract all digits
    const digits = input.replace(/\D/g, "");
    const numericValue = Number.parseInt(digits || "0", 10);

    // Check Max Value
    if (maxValue !== undefined && numericValue / 100 > maxValue) {
      return;
    }

    updateValue(numericValue);
  };

  const updateValue = (newRawValue: number) => {
    setRawValue(newRawValue);

    const numericValue = newRawValue / 100;
    const formattedValue = formatCurrency(numericValue);

    if (onValueChange) {
      onValueChange(formattedValue, numericValue);
    }

    // Create a synthetic event for onChange
    if (onChange && internalInputRef.current) {
      const event = new Event("change", {
        bubbles: true,
      }) as unknown as React.ChangeEvent<HTMLInputElement>;
      Object.defineProperty(event, "target", {
        writable: true,
        value: { value: formattedValue },
      });
      onChange(event);
    }
  };

  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
    // Always move cursor to end on focus
    requestAnimationFrame(() => {
      if (internalInputRef.current) {
        const len = internalInputRef.current.value.length;
        internalInputRef.current.setSelectionRange(len, len);
      }
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  // Force cursor to end on render if focused
  useEffect(() => {
    if (isFocused && internalInputRef.current) {
      const len = internalInputRef.current.value.length;
      internalInputRef.current.setSelectionRange(len, len);
    }
  });

  const displayValue = rawValue === 0 && !isFocused ? "" : formatCurrency(rawValue / 100);

  return (
    <TextField
      {...props}
      inputRef={internalInputRef}
      value={displayValue}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      inputMode="numeric"
      placeholder="R$ 0,00"
    />
  );
};
