"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { useViaCep } from "@workspace/forms/hooks/use-viacep";
import { formatZipCode } from "@workspace/forms/utils/formatting";
import type { CepFieldProps } from "@workspace/forms/types/address.types";

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "Enter",
  ];
  const isDigit = e.key >= "0" && e.key <= "9";
  if (!isDigit && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};

export const CepField = ({
  value = "",
  onChange,
  onAddressFound,
  onError,
  label = "CEP",
  placeholder = "00000-000",
  required = false,
  disabled = false,
  errorMessage: externalError,
  helperText,
  size = "md",
  ref,
  ...props
}: CepFieldProps) => {
  const id = useId();
  const [inputValue, setInputValue] = useState(value);
  const [touched, setTouched] = useState(false);
  const { data, loading, error, fetchAddress } = useViaCep(300);

  const lastProcessedCepRef = useRef<string | null>(null);
  const lastProcessedDataRef = useRef<string | null>(null);
  const onAddressFoundRef = useRef(onAddressFound);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onAddressFoundRef.current = onAddressFound;
    onErrorRef.current = onError;
  }, [onAddressFound, onError]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const cleanCep = inputValue.replace(/\D/g, "");
    if (cleanCep.length === 8 && cleanCep !== lastProcessedCepRef.current) {
      lastProcessedCepRef.current = cleanCep;
      void fetchAddress(inputValue);
    } else if (cleanCep.length !== 8) {
      lastProcessedCepRef.current = null;
      lastProcessedDataRef.current = null;
    }
  }, [inputValue, fetchAddress]);

  useEffect(() => {
    if (data && onAddressFoundRef.current) {
      const currentCep = data.postalCode.replace(/\D/g, "");
      if (currentCep !== lastProcessedDataRef.current) {
        lastProcessedDataRef.current = currentCep;
        onAddressFoundRef.current(data);
      }
    }
  }, [data]);

  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (error && onErrorRef.current && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      onErrorRef.current(error);
    } else if (!error) {
      lastErrorRef.current = null;
    }
  }, [error]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 8);
    const formatted = formatZipCode(digitsOnly);

    setInputValue(formatted);
    onChange?.(formatted);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    props.onBlur?.(e);
  };

  const hasError = Boolean(externalError || (touched && error));
  const errorMessage = externalError || (touched && error ? error : null);

  const sizeClasses = {
    sm: { input: "h-8 text-sm px-2 py-1", icon: "h-3.5 w-3.5", iconPadding: "px-2.5" },
    md: { input: "h-10 text-base px-3 py-2", icon: "h-4 w-4", iconPadding: "px-3" },
    lg: { input: "h-11 text-lg px-4 py-3", icon: "h-5 w-5", iconPadding: "px-3.5" },
  };

  const variantClasses = {
    default: "bg-input",
    ghost: "bg-transparent",
  } as const;

  const variant = (props.variant as "default" | "ghost") || "default";

  return (
    <Field
      data-invalid={hasError}
      data-disabled={disabled}
      data-size={size}
      className={props.containerClassName}
    >
      {label && (
        <FieldLabel
          htmlFor={id}
          className={cn(
            {
              "text-xs": size === "sm",
              "text-sm": size === "md",
              "text-base": size === "lg",
            },
            props.labelClassName,
          )}
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </FieldLabel>
      )}

      <div className="relative w-full">
        <Input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9-]*"
          autoComplete="postal-code"
          placeholder={placeholder}
          maxLength={9}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={disabled || loading}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            (helperText && !errorMessage) || errorMessage ? `${id}-description` : undefined
          }
          className={cn(
            sizeClasses[size].input,
            variantClasses[variant],
            {
              "cursor-text": !disabled && !loading,
            },
            props.className,
          )}
          {...props}
        />
      </div>

      {helperText && !errorMessage && (
        <FieldDescription id={`${id}-description`} className={props.helperTextClassName}>
          {helperText}
        </FieldDescription>
      )}

      {errorMessage && (
        <FieldError id={`${id}-description`} className={props.errorMessageClassName}>
          {errorMessage}
        </FieldError>
      )}
    </Field>
  );
};

export default CepField;
