"use client";

import { useId } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { cn } from "@workspace/ui/lib/utils";

export interface FluriFieldV2RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface FluriFieldV2RadioGroupProps {
  label: string;
  options: FluriFieldV2RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  containerClassName?: string;
  className?: string;
}

const FluriFieldV2RadioGroup = ({
  label,
  options,
  value,
  onValueChange,
  helperText,
  errorMessage,
  disabled,
  required,
  containerClassName,
  className,
}: FluriFieldV2RadioGroupProps) => {
  const id = useId();
  const hasError = Boolean(errorMessage);

  return (
    <Field
      data-invalid={hasError}
      data-disabled={disabled}
      className={cn("w-full", containerClassName)}
    >
      <div
        className={cn(
          "rounded-2xl border border-transparent bg-muted/50 px-4 py-3 transition-all",
          "focus-within:ring-[3px] focus-within:ring-ring/50",
          hasError && "border-destructive focus-within:ring-destructive/40",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <FieldLabel
          htmlFor={id}
          {...(required !== undefined && { required })}
          className="mb-2 block text-sm font-medium"
        >
          {label}
        </FieldLabel>

        <RadioGroup
          id={id}
          {...(value !== undefined && { value })}
          {...(onValueChange !== undefined && { onValueChange })}
          {...(disabled !== undefined && { disabled })}
          aria-invalid={hasError}
          aria-describedby={helperText || hasError ? `${id}-description` : undefined}
          className={cn("gap-2", className)}
        >
          {options.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-3 rounded-xl border border-transparent px-3 py-2 transition-colors",
                "hover:bg-background/60",
                option.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <RadioGroupItem value={option.value} disabled={option.disabled} className="mt-0.5" />
              <span className="space-y-0.5">
                <span className="block text-sm">{option.label}</span>
                {option.description ? (
                  <span className="block text-xs text-muted-foreground">{option.description}</span>
                ) : null}
              </span>
            </label>
          ))}
        </RadioGroup>

        {hasError && errorMessage ? (
          <FieldError id={`${id}-description`} className="mt-2 text-xs">
            {errorMessage}
          </FieldError>
        ) : helperText ? (
          <FieldDescription id={`${id}-description`} className="mt-2 text-xs">
            {helperText}
          </FieldDescription>
        ) : null}
      </div>
    </Field>
  );
};

export { FluriFieldV2RadioGroup };
export default FluriFieldV2RadioGroup;
