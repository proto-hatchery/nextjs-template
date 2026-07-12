"use client";

import Link from "next/link";
import { type Ref, useId } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";

export type TextFieldSize = "sm" | "md" | "lg";
export type TextFieldVariant = "default" | "ghost";

export interface TextFieldLinkInfo {
  label: string;

  href: string;

  ariaLabel: string;
}

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  ref?: React.Ref<HTMLInputElement>;
  label?: string;

  helperText?: string | React.ReactNode;

  errorMessage?: string;

  startIcon?: React.ReactNode;

  endIcon?: React.ReactNode;

  size?: TextFieldSize;

  variant?: TextFieldVariant;

  containerClassName?: string;

  labelClassName?: string;

  helperTextClassName?: string;

  hideLabel?: boolean;

  required?: boolean;

  disabled?: boolean;

  linkInfo?: TextFieldLinkInfo;

  inputRef?: Ref<HTMLInputElement>;
}

const TextField = ({
  className,
  label,
  helperText,
  errorMessage,
  startIcon,
  endIcon,
  size = "md",
  variant = "default",
  containerClassName,
  labelClassName,
  helperTextClassName,
  hideLabel = false,
  type = "text",
  required,
  disabled,
  linkInfo,
  inputRef,
  ref,
  ...props
}: TextFieldProps) => {
  const id = useId();

  const sizeClasses = {
    sm: { input: "h-8 text-sm px-2 py-1", icon: "px-2.5", iconSize: 14 },
    md: { input: "h-10 text-base px-3 py-2", icon: "px-3", iconSize: 16 },
    lg: { input: "h-11 text-lg px-4 py-3", icon: "px-3.5", iconSize: 18 },
  };

  const variantClasses = {
    default: "bg-input",
    ghost: "bg-transparent",
  } as const;

  const paddingClasses = cn({
    "ps-8": !!startIcon && size === "sm",
    "ps-10": !!startIcon && size === "md",
    "ps-12": !!startIcon && size === "lg",
    "pe-8": !!endIcon && size === "sm",
    "pe-10": !!endIcon && size === "md",
    "pe-12": !!endIcon && size === "lg",
  });

  return (
    <Field
      data-invalid={!!errorMessage}
      data-disabled={disabled}
      data-size={size}
      className={cn(containerClassName)}
    >
      {label && !hideLabel && (
        <div className="flex items-center justify-between w-full">
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
          {linkInfo && (
            <Link
              href={linkInfo.href}
              className={cn(
                "text-primary hover:text-primary/80 focus-visible:ring-ring rounded-sm text-sm font-normal transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              )}
              aria-label={linkInfo.ariaLabel}
              tabIndex={0}
            >
              {linkInfo.label}
            </Link>
          )}
        </div>
      )}

      <div className="relative flex w-full">
        <Input
          ref={(node) => {
            if (typeof ref === "function") ref(node);
            else if (ref) {
              (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }

            if (typeof inputRef === "function") inputRef(node);
            else if (inputRef) {
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }
          }}
          id={id}
          type={type}
          required={required}
          disabled={disabled}
          className={cn(
            sizeClasses[size].input,
            paddingClasses,
            variantClasses[variant],
            {
              "cursor-text": !disabled,
            },
            className,
          )}
          {...props}
          aria-invalid={!!errorMessage}
        />

        {startIcon && (
          <div
            className={cn(
              "text-muted-foreground/80 absolute inset-y-0 start-0 flex items-center",
              sizeClasses[size].icon,

              typeof startIcon === "string" ? "pointer-events-none" : "",
            )}
          >
            <div className="flex h-full items-center justify-center leading-none [&_button]:p-0 [&_button]:leading-none [&_svg]:block">
              {typeof startIcon === "string" ? (
                <span style={{ fontSize: sizeClasses[size].iconSize }}>{startIcon}</span>
              ) : (
                startIcon
              )}
            </div>
          </div>
        )}

        {endIcon && (
          <div
            className={cn(
              "text-muted-foreground/80 absolute inset-y-0 end-0 flex items-center",
              sizeClasses[size].icon,
            )}
          >
            <div className="flex h-full items-center justify-center leading-none [&_button]:p-0 [&_button]:leading-none [&_svg]:block">
              {typeof endIcon === "string" ? (
                <span style={{ fontSize: sizeClasses[size].iconSize }}>{endIcon}</span>
              ) : (
                endIcon
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && !errorMessage && (
        <FieldDescription className={helperTextClassName}>{helperText}</FieldDescription>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
};

export default TextField;
