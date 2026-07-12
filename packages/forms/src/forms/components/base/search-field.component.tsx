"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { useId, useRef } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";

export type SearchFieldSize = "sm" | "md" | "lg";
export type SearchFieldVariant = "default" | "ghost";

export interface SearchFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  ref?: React.Ref<HTMLInputElement>;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  size?: SearchFieldSize;
  variant?: SearchFieldVariant;
  containerClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  hideLabel?: boolean;
}

const SearchField = ({
  label,
  helperText,
  errorMessage,
  placeholder = "Pesquisar...",
  size = "md",
  variant = "default",
  containerClassName,
  labelClassName,
  helperTextClassName,
  hideLabel = false,
  value,
  onChange,
  disabled = false,
  required = false,
  className,
  ref,
  ...props
}: SearchFieldProps) => {
  const id = useId();
  const internalRef = useRef<HTMLInputElement>(null);

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (internalRef.current) {
      // Set value directly for uncontrolled inputs
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeSetter?.call(internalRef.current, "");
      const event = new Event("input", { bubbles: true });
      internalRef.current.dispatchEvent(event);
    }

    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: {
          ...internalRef.current,
          value: "",
          name: props.name || id,
        },
        currentTarget: {
          ...internalRef.current,
          value: "",
          name: props.name || id,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const sizeClasses = {
    sm: {
      input: "h-8 text-sm pl-8 pr-8",
      icon: { size: 14, leftPadding: "pl-2.5", rightPadding: "pr-2.5" },
    },
    md: {
      input: "h-10 text-base pl-10 pr-10",
      icon: { size: 16, leftPadding: "pl-3", rightPadding: "pr-3" },
    },
    lg: {
      input: "h-12 text-lg pl-12 pr-12",
      icon: { size: 18, leftPadding: "pl-3.5", rightPadding: "pr-3.5" },
    },
  };

  const variantClasses = {
    default: "bg-input border-input",
    ghost: "bg-transparent border-input",
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

      <div className="relative w-full">
        <div
          className={cn(
            "text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center",
            sizeClasses[size].icon.leftPadding,
            {
              "opacity-50": disabled,
            },
          )}
        >
          <SearchIcon size={sizeClasses[size].icon.size} />
        </div>

        <Input
          ref={(node) => {
            internalRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          id={id}
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            sizeClasses[size].input,
            variantClasses[variant],
            {
              "cursor-text": !disabled,
            },
            "shadow-none peer [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
            className,
          )}
          aria-invalid={!!errorMessage}
          {...props}
        />

        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "absolute inset-y-0 right-0 flex items-center text-muted-foreground/80 hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full hidden peer-[:not(:placeholder-shown)]:flex",
            sizeClasses[size].icon.rightPadding,
            {
              hidden: disabled,
            },
          )}
          tabIndex={-1}
          aria-label="Limpar pesquisa"
        >
          <X size={sizeClasses[size].icon.size} />
        </button>
      </div>

      {helperText && !errorMessage && (
        <FieldDescription className={helperTextClassName}>{helperText}</FieldDescription>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
};

export default SearchField;
