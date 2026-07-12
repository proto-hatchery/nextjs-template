"use client";

import type { CheckedState } from "@radix-ui/react-checkbox";
import { useId } from "react";

import { Checkbox } from "@workspace/ui/components/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { cn } from "@workspace/ui/lib/utils";

export interface FluriFieldV2CheckboxProps {
  label: string;
  checked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  containerClassName?: string;
}

const FluriFieldV2Checkbox = ({
  label,
  checked,
  onCheckedChange,
  helperText,
  errorMessage,
  disabled,
  required,
  containerClassName,
}: FluriFieldV2CheckboxProps) => {
  const id = useId();
  const hasError = Boolean(errorMessage);

  return (
    <Field
      data-invalid={hasError}
      data-disabled={disabled}
      className={cn("w-full", containerClassName)}
    >
      <label
        htmlFor={id}
        className={cn(
          "flex items-start gap-3 rounded-2xl bg-muted/50 px-4 py-3 transition-all",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <Checkbox
          id={id}
          {...(checked !== undefined ? { checked } : {})}
          {...(onCheckedChange !== undefined ? { onCheckedChange } : {})}
          className="mt-0.5"
          aria-invalid={hasError}
          aria-describedby={helperText || hasError ? `${id}-description` : undefined}
          {...(disabled !== undefined ? { disabled } : {})}
        />
        <div className="min-w-0 space-y-1">
          <FieldLabel
            htmlFor={id}
            className="text-sm font-medium"
            {...(required !== undefined ? { required } : {})}
          >
            {label}
          </FieldLabel>
          {hasError && errorMessage ? (
            <FieldError id={`${id}-description`} className="text-xs">
              {errorMessage}
            </FieldError>
          ) : helperText ? (
            <FieldDescription id={`${id}-description`} className="text-xs">
              {helperText}
            </FieldDescription>
          ) : null}
        </div>
      </label>
    </Field>
  );
};

export { FluriFieldV2Checkbox };
export default FluriFieldV2Checkbox;
