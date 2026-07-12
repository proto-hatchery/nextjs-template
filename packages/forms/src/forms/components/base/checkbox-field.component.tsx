"use client";

import { useId } from "react";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import { cn } from "@workspace/ui/lib/utils";

export type CheckboxFieldSize = "sm" | "md" | "lg";
export type CheckboxFieldLabelPosition = "top" | "side";

export interface CheckboxFieldProps {
  ref?: React.Ref<React.ComponentRef<typeof Checkbox>>;
  label?: string;

  helperText?: string;

  errorMessage?: string;

  size?: CheckboxFieldSize;

  labelPosition?: CheckboxFieldLabelPosition;

  containerClassName?: string;

  labelClassName?: string;

  helperTextClassName?: string;

  checkboxClassName?: string;

  hideLabel?: boolean;

  checked?: boolean | "indeterminate";

  defaultChecked?: boolean | "indeterminate";

  onCheckedChange?: (checked: boolean | "indeterminate") => void;

  disabled?: boolean;

  required?: boolean;

  checkboxProps?: React.ComponentProps<typeof Checkbox>;

  value?: boolean | "indeterminate";
  onChange?: (checked: boolean | "indeterminate") => void;
}

const CheckboxField = ({
  label,
  helperText,
  errorMessage,
  size = "md",
  labelPosition = "side",
  containerClassName,
  labelClassName,
  helperTextClassName,
  checkboxClassName,
  hideLabel = false,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  required = false,
  checkboxProps,
  value,
  onChange,
  ref,
}: CheckboxFieldProps) => {
  const id = useId();

  const sizeClasses = {
    sm: { checkbox: "h-3 w-3", gap: "gap-1.5", text: "text-xs" },
    md: { checkbox: "h-4 w-4", gap: "gap-2", text: "text-sm" },
    lg: { checkbox: "h-5 w-5", gap: "gap-2.5", text: "text-base" },
  };

  const resolvedChecked = typeof checked !== "undefined" ? checked : value;
  const hasExtraContent = (helperText && !errorMessage) || errorMessage;

  return (
    <Field
      orientation={labelPosition === "top" ? "vertical" : "horizontal"}
      data-invalid={!!errorMessage}
      data-disabled={disabled}
      data-size={size}
      className={cn(containerClassName)}
    >
      <Checkbox
        ref={ref}
        id={id}
        {...(resolvedChecked !== undefined ? { checked: resolvedChecked } : {})}
        {...(defaultChecked !== undefined ? { defaultChecked } : {})}
        onCheckedChange={(next) => {
          onCheckedChange?.(next);
          onChange?.(next);
        }}
        disabled={disabled}
        className={cn(
          sizeClasses[size].checkbox,
          "cursor-pointer disabled:cursor-default",
          hasExtraContent && "mt-0.5",
          "data-[state=unchecked]:border-foreground/30 hover:data-[state=unchecked]:border-foreground/50",
          checkboxClassName,
        )}
        aria-invalid={!!errorMessage}
        aria-required={required}
        {...checkboxProps}
      />

      {hasExtraContent ? (
        <FieldContent>
          {label && !hideLabel && (
            <FieldLabel
              htmlFor={id}
              className={cn(
                "cursor-pointer",
                sizeClasses[size].text,
                {
                  "cursor-not-allowed opacity-50": disabled,
                },
                labelClassName,
              )}
            >
              {label}
              {required && <span className="text-destructive">*</span>}
            </FieldLabel>
          )}

          {helperText && !errorMessage && (
            <FieldDescription className={helperTextClassName}>{helperText}</FieldDescription>
          )}

          {errorMessage && <FieldError>{errorMessage}</FieldError>}
        </FieldContent>
      ) : (
        label &&
        !hideLabel && (
          <FieldLabel
            htmlFor={id}
            className={cn(
              "cursor-pointer",
              sizeClasses[size].text,
              {
                "cursor-not-allowed opacity-50": disabled,
              },
              labelClassName,
            )}
          >
            {label}
            {required && <span className="text-destructive">*</span>}
          </FieldLabel>
        )
      )}
    </Field>
  );
};

export default CheckboxField;
