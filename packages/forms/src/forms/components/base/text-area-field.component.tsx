"use client";

import { useId } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";

export type TextAreaFieldSize = "sm" | "md" | "lg";
export type TextAreaFieldVariant = "default" | "ghost";

export interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>;
  label?: string;

  helperText?: string;

  errorMessage?: string;

  size?: TextAreaFieldSize;

  variant?: TextAreaFieldVariant;

  containerClassName?: string;

  labelClassName?: string;

  helperTextClassName?: string;

  hideLabel?: boolean;

  resizable?: boolean;

  required?: boolean;

  disabled?: boolean;
}

const TextAreaField = ({
  className,
  label,
  helperText,
  errorMessage,
  size = "md",
  variant = "default",
  containerClassName,
  labelClassName,
  helperTextClassName,
  hideLabel = false,
  resizable = true,
  rows = 4,
  required,
  disabled,
  ref,
  ...props
}: TextAreaFieldProps) => {
  const id = useId();

  const sizeClasses = {
    sm: "min-h-16 text-sm p-2",
    md: "min-h-20 text-base p-2",
    lg: "min-h-24 text-lg p-3",
  };

  const variantClasses = {
    default: "bg-input",
    ghost: "bg-transparent",
  } as const;

  const currentLength = (() => {
    const value =
      ("value" in props ? props.value : "defaultValue" in props ? props.defaultValue : "") ?? "";
    try {
      return typeof value === "string" ? value.length : String(value ?? "").length;
    } catch {
      return 0;
    }
  })();

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

      <Textarea
        ref={ref}
        id={id}
        rows={rows}
        required={required}
        disabled={disabled}
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          {
            "resize-none": !resizable,
            "resize-y": resizable,
            "cursor-text": !disabled,
          },
          className,
        )}
        {...props}
        aria-invalid={!!errorMessage}
      />

      {helperText && !errorMessage && (
        <FieldDescription className={helperTextClassName}>{helperText}</FieldDescription>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}

      {"maxLength" in props && typeof props.maxLength === "number" && (
        <div className="text-muted-foreground/80 text-right text-[11px]">
          {currentLength}/{props.maxLength}
        </div>
      )}
    </Field>
  );
};

export default TextAreaField;
