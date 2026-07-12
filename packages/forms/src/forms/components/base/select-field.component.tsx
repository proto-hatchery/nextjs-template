"use client";

import { useId } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";

export type SelectFieldSize = "sm" | "md" | "lg";
export type SelectFieldVariant = "default" | "ghost";

export interface SelectFieldProps {
  ref?: React.Ref<React.ComponentRef<typeof SelectTrigger>>;
  label?: string;

  helperText?: string;

  errorMessage?: string;

  placeholder?: string;

  size?: SelectFieldSize;

  variant?: SelectFieldVariant;

  containerClassName?: string;

  labelClassName?: string;

  helperTextClassName?: string;

  triggerClassName?: string;

  contentClassName?: string;

  hideLabel?: boolean;

  value?: string;

  defaultValue?: string;

  onValueChange?: (value: string) => void;

  disabled?: boolean;

  required?: boolean;

  contentProps?: React.ComponentProps<typeof SelectContent>;

  triggerProps?: React.ComponentProps<typeof SelectTrigger>;

  children: React.ReactNode;
}

const SelectField = ({
  label,
  helperText,
  errorMessage,
  placeholder = "Selecione uma opção",
  size = "md",
  variant = "default",
  containerClassName,
  labelClassName,
  helperTextClassName,
  triggerClassName,
  contentClassName,
  hideLabel = false,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  required = false,
  contentProps,
  triggerProps,
  children,
  ref,
}: SelectFieldProps) => {
  const id = useId();

  const sizeClasses = {
    sm: "!h-8 text-sm px-2",
    md: "!h-10 text-base px-3",
    lg: "!h-11 text-lg px-4",
  };

  const variantClasses = {
    default: "bg-input",
    ghost: "bg-transparent",
  } as const;

  return (
    <Field
      data-invalid={!!errorMessage}
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

      <Select
        {...(value !== undefined ? { value } : {})}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        {...(onValueChange !== undefined ? { onValueChange } : {})}
        disabled={disabled}
      >
        <SelectTrigger
          ref={ref}
          id={id}
          className={cn(
            sizeClasses[size],
            variantClasses[variant],
            {
              "cursor-pointer": !disabled,
            },
            triggerClassName,
          )}
          aria-invalid={!!errorMessage}
          aria-required={required}
          {...triggerProps}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className={cn(contentClassName)} {...contentProps}>
          {children}
        </SelectContent>
      </Select>

      {helperText && !errorMessage && (
        <FieldDescription className={helperTextClassName}>{helperText}</FieldDescription>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
};

export default SelectField;
