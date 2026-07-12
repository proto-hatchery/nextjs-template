"use client";

import { OTPInput, type SlotProps } from "input-otp";
import { useId, useState } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { cn } from "@workspace/ui/lib/utils";

import type { OtpFieldProps } from "@workspace/forms/types";

function OtpField({
  label,
  maxLength = 6,
  value,
  defaultValue,
  disabled = false,
  required = false,
  error,
  helperText,
  className,
  containerClassName,
  onChange,
  onComplete,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  ref,
  ...props
}: OtpFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helperTextId = `${id}-helper`;

  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);

    if (newValue.length === maxLength) {
      onComplete?.(newValue);
    }
  };

  const describedBy =
    [error ? errorId : undefined, helperText ? helperTextId : undefined, ariaDescribedBy]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Field data-invalid={!!error} data-disabled={disabled} className={cn(className)}>
      {label && (
        <FieldLabel htmlFor={id} className={cn("block text-center", disabled && "opacity-50")}>
          {label}
          {required && (
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </FieldLabel>
      )}

      <OTPInput
        id={id}
        ref={ref}
        value={currentValue}
        onChange={handleValueChange}
        maxLength={maxLength}
        disabled={disabled}
        inputMode="numeric"
        pattern="\d*"
        autoComplete="one-time-code"
        containerClassName={cn(
          "flex items-center justify-center gap-2 has-disabled:opacity-50",
          containerClassName,
        )}
        aria-label={ariaLabel || label || "Código de verificação"}
        aria-describedby={describedBy}
        aria-invalid={error ? "true" : "false"}
        aria-required={required}
        render={({ slots }) => (
          <div className="flex gap-2">
            {slots.map((slot, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <Slot key={idx} {...slot} hasError={!!error} />
            ))}
          </div>
        )}
        {...props}
      />

      {error && <FieldError className="text-center">{error}</FieldError>}

      {helperText && !error && (
        <FieldDescription className="text-center">{helperText}</FieldDescription>
      )}
    </Field>
  );
}

interface SlotComponentProps extends SlotProps {
  hasError?: boolean;
}

function Slot({ hasError = false, ...props }: SlotComponentProps) {
  return (
    <div
      className={cn(
        "relative flex size-12 items-center justify-center rounded-xl bg-input text-xl font-semibold text-foreground transition-all",
        {
          "ring-ring/30 ring-4": props.isActive,
          "ring-destructive ring-2": hasError,
        },
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.char === null && props.isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-0.5 animate-pulse bg-foreground/50" />
        </div>
      )}
    </div>
  );
}

export { OtpField };
export default OtpField;
