"use client";

import { useId } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";

export interface FluriFieldV2SwitchProps {
  label: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  containerClassName?: string;
}

const FluriFieldV2Switch = ({
  label,
  checked,
  onCheckedChange,
  helperText,
  errorMessage,
  disabled,
  required,
  containerClassName,
}: FluriFieldV2SwitchProps) => {
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
          "flex items-start justify-between gap-3 rounded-2xl bg-muted/50 px-4 py-3 transition-all",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <div className="min-w-0 space-y-1">
          <FieldLabel
            htmlFor={id}
            {...(required !== undefined && { required })}
            className="text-sm font-medium"
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

        <Switch
          id={id}
          {...(checked !== undefined && { checked })}
          {...(onCheckedChange !== undefined && { onCheckedChange })}
          {...(disabled !== undefined && { disabled })}
          className="mt-0.5"
          aria-invalid={hasError}
          aria-describedby={helperText || hasError ? `${id}-description` : undefined}
        />
      </label>
    </Field>
  );
};

export { FluriFieldV2Switch };
export default FluriFieldV2Switch;
