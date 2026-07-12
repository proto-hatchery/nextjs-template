"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { formatDate, formatISODateToString, parseDate } from "@workspace/forms/fields/utils/date-formatting";
import type { TextFieldProps, TextFieldSize, TextFieldVariant } from "@workspace/forms/components/base/text-field.component";

/**
 * Validates a date string in DD/MM/YYYY format
 * Returns an error message if invalid, null if valid
 */
function validateBirthdate(value: string): string | null {
  if (!value || value.length === 0) {
    return null; // Empty is valid (use required prop for mandatory)
  }

  const digits = value.replace(/\D/g, "");

  // Not complete yet
  if (digits.length < 8) {
    return null;
  }

  const day = Number.parseInt(digits.slice(0, 2), 10);
  const month = Number.parseInt(digits.slice(2, 4), 10);
  const year = Number.parseInt(digits.slice(4, 8), 10);

  // Validate day range
  if (day < 1 || day > 31) {
    return "Dia inválido (01-31)";
  }

  // Validate month range
  if (month < 1 || month > 12) {
    return "Mês inválido (01-12)";
  }

  // Validate year range (between 1900 and current year)
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return `Ano inválido (1900-${currentYear})`;
  }

  // Check if the date actually exists (e.g., 31/02 is invalid)
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return "Data inválida";
  }

  // Check if date is not in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) {
    return "Data não pode ser no futuro";
  }

  return null;
}

export interface BirthdateFieldProps extends Omit<TextFieldProps, "type" | "value" | "onChange"> {
  /** Controlled value in YYYY-MM-DD format (ISO date string) */
  value?: string;

  /** Callback when the date value changes (only called with valid dates in YYYY-MM-DD format) */
  onChange?: (value: string | undefined) => void;

  /** Callback when the string value changes (called on every input) */
  onValueChange?: (value: string) => void;

  /** Callback when the date is complete (8 digits entered) */
  onComplete?: () => void;

  /** Custom validation error message (overrides built-in validation) */
  errorMessage?: string;

  /** Show validation errors automatically */
  showValidationErrors?: boolean;
}

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Allow meta/ctrl combinations (copy, paste, etc.)
  if (e.metaKey || e.ctrlKey) return;

  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "Enter",
    "/",
  ];
  const isDigit = e.key >= "0" && e.key <= "9";

  if (!isDigit && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};

const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
  const nativeEvent = e.nativeEvent as unknown as { data?: string; inputType?: string };
  const data = nativeEvent.data ?? "";
  const inputType = nativeEvent.inputType ?? "";
  const isDeletion = inputType.startsWith("delete");

  // Block non-numeric input (except slash)
  // Allow deletion operations and slash
  if (!isDeletion && data !== "/" && /\D/.test(data)) {
    e.preventDefault();
  }
  // Don't block deletions or valid input - let formatDate handle length limits
};

export const BirthdateField = ({
  label,
  helperText,
  errorMessage: externalError,
  size = "md",
  variant = "default",
  containerClassName,
  labelClassName,
  helperTextClassName,
  hideLabel = false,
  value: controlledValue,
  onChange,
  onValueChange,
  onComplete,
  disabled = false,
  required = false,
  placeholder = "dd/mm/aaaa",
  showValidationErrors = true,
  className,
  ref,
  ...props
}: BirthdateFieldProps) => {
  const id = useId();
  // Store the last committed value to detect external changes
  const lastCommittedValueRef = useRef<string | undefined>(controlledValue);
  const [inputValue, setInputValue] = useState<string>(() =>
    controlledValue ? formatISODateToString(controlledValue) : "",
  );
  const [touched, setTouched] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sync with external controlled value - use layout effect to avoid flicker
  const stableControlledValue = controlledValue;
  useLayoutEffect(() => {
    if (!isEditing && stableControlledValue !== lastCommittedValueRef.current) {
      const formatted = stableControlledValue ? formatISODateToString(stableControlledValue) : "";
      setInputValue(formatted);
      lastCommittedValueRef.current = stableControlledValue;
    }
  }, [stableControlledValue, isEditing]);

  // Display value: use inputValue when user is editing, controlledValue when stable
  const displayValue = isEditing
    ? inputValue
    : controlledValue
      ? formatISODateToString(controlledValue)
      : inputValue;

  // Internal validation
  const validationError = useMemo(() => {
    if (!showValidationErrors || !touched) return null;
    return validateBirthdate(displayValue);
  }, [displayValue, showValidationErrors, touched]);

  // Final error message (external takes precedence)
  const errorMessage = externalError || validationError;
  const hasError = !!errorMessage;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditing(true);
    const rawValue = event.currentTarget.value;
    const formatted = formatDate(rawValue);

    setInputValue(formatted);

    const parsedDateISO = parseDate(formatted);

    if (parsedDateISO) {
      onChange?.(parsedDateISO);
      onValueChange?.(formatted);
      // Check if date is complete (8 digits)
      const digits = formatted.replace(/\D/g, "");
      if (digits.length === 8) {
        onComplete?.();
      }
    } else if (formatted.length === 0) {
      onChange?.(undefined);
      onValueChange?.("");
    } else {
      onValueChange?.(formatted);
      // Check if date is complete (8 digits)
      const digits = formatted.replace(/\D/g, "");
      if (digits.length === 8) {
        onComplete?.();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text") || "";
    const formatted = formatDate(raw);
    const target = e.currentTarget;

    target.value = formatted;
    setInputValue(formatted);

    const parsedDateISO = parseDate(formatted);
    if (parsedDateISO) {
      onChange?.(parsedDateISO);
      onValueChange?.(formatted);
    } else {
      onValueChange?.(formatted);
    }

    target.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    setIsEditing(false);
    props.onBlur?.(e);
  };

  // Size classes matching TextField
  const sizeClasses: Record<TextFieldSize, { input: string }> = {
    sm: { input: "h-8 text-sm px-2 py-1" },
    md: { input: "h-10 text-base md:text-sm px-3 py-1" },
    lg: { input: "h-11 text-lg px-4 py-3" },
  };

  // Variant classes matching TextField
  const variantClasses: Record<TextFieldVariant, string> = {
    default: "bg-input",
    ghost: "bg-transparent",
  };

  return (
    <Field
      data-invalid={hasError}
      data-disabled={disabled}
      data-size={size}
      className={cn(containerClassName)}
    >
      {label && !hideLabel && (
        <FieldLabel
          htmlFor={id}
          className={cn(
            {
              "text-xs": size === "sm",
              "text-sm": size === "md",
              "text-base": size === "lg",
            },
            labelClassName,
          )}
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </FieldLabel>
      )}

      <Input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9/]*"
        autoComplete="bday"
        placeholder={placeholder}
        maxLength={10}
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBeforeInput={handleBeforeInput}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-describedby={
          (helperText && !errorMessage) || errorMessage ? `${id}-description` : undefined
        }
        className={cn(sizeClasses[size].input, variantClasses[variant], className)}
        {...props}
      />

      {helperText && !errorMessage && (
        <FieldDescription id={`${id}-description`} className={helperTextClassName}>
          {helperText}
        </FieldDescription>
      )}

      {errorMessage && <FieldError id={`${id}-description`}>{errorMessage}</FieldError>}
    </Field>
  );
};

export default BirthdateField;
