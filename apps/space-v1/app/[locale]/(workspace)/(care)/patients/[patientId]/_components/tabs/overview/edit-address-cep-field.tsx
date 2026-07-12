"use client";

import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { useViaCep } from "@workspace/ui/hooks/use-viacep";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { useEffect, useId, useState } from "react";

import type { AddressData } from "./edit-address-schema";

const formatZipCode = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length <= 5) {
    return digitsOnly;
  }
  return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 8)}`;
};

interface CepFieldWithChangeButtonProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: { message?: string };
  showAddressFields: boolean;
  onAddressFound: (address: AddressData) => void;
  onError: (error: string) => void;
  onChangeCep: () => void;
  inputRef?: React.Ref<HTMLInputElement>;
  helperText?: React.ReactNode;
}

export function CepFieldWithChangeButton({
  value,
  onChange,
  onBlur,
  error,
  showAddressFields,
  onAddressFound,
  onError,
  onChangeCep,
  inputRef,
  helperText,
}: CepFieldWithChangeButtonProps) {
  const cepId = useId();
  const [inputValue, setInputValue] = useState(value);
  const { data, loading, error: cepError, fetchAddress, clearAddress } = useViaCep(300);

  useEffect(() => {
    setInputValue(value);
    if (!value || value.trim() === "") {
      clearAddress();
    }
  }, [value, clearAddress]);

  useEffect(() => {
    const cleanCep = inputValue.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      void fetchAddress(inputValue);
    } else if (cleanCep.length < 8) {
      clearAddress();
    }
  }, [inputValue, fetchAddress, clearAddress]);

  useEffect(() => {
    if (data) {
      onAddressFound(data);
    }
  }, [data, onAddressFound]);

  useEffect(() => {
    if (cepError) {
      onError(cepError);
    }
  }, [cepError, onError]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 8);
    const formatted = formatZipCode(digitsOnly);

    setInputValue(formatted);
    onChange(formatted);
  };

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

  const hasError = Boolean(error ?? cepError);
  const errorMessage = error?.message ?? cepError ?? null;
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = inputValue.length > 0;
  const shouldFloatLabel = isFocused || hasValue || showAddressFields;

  return (
    <Field
      data-invalid={hasError}
      data-disabled={showAddressFields}
      data-size="md"
      className="overflow-visible w-full"
    >
      <div className="relative p-[3px] -m-[3px] overflow-visible">
        <div
          className={cn(
            "relative bg-muted/50 border border-transparent transition-all duration-200",
            "focus-within:ring-[3px] focus-within:ring-ring/50",
            "h-12 rounded-2xl",
            hasError && "border-destructive",
            hasError && "focus-within:ring-destructive/40",
            showAddressFields && "opacity-50 cursor-not-allowed",
          )}
        >
          <FieldLabel
            htmlFor={cepId}
            className={cn(
              "absolute pointer-events-none text-muted-foreground transition-all duration-200 ease-out origin-left",
              "text-base left-4",
              shouldFloatLabel ? "text-[11px] top-1.5" : "top-1/2 -translate-y-1/2",
              shouldFloatLabel && "text-muted-foreground/80 font-semibold",
            )}
          >
            CEP
          </FieldLabel>

          <Input
            ref={inputRef}
            id={cepId}
            type="text"
            inputMode="numeric"
            pattern="[0-9-]*"
            autoComplete="postal-code"
            placeholder=" "
            maxLength={9}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={(_e) => {
              setIsFocused(false);
              onBlur();
            }}
            disabled={showAddressFields || loading}
            aria-invalid={hasError}
            aria-describedby={
              (!showAddressFields && "Digite o CEP para buscar o endereço automaticamente") ||
              errorMessage
                ? `${cepId}-description`
                : undefined
            }
            className={cn(
              "w-full border-0 bg-transparent shadow-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-transparent focus:placeholder:text-muted-foreground/50",
              "h-12 px-4 pt-5 pb-1 text-base",
              showAddressFields ? "pr-20" : undefined,
            )}
          />

          {showAddressFields && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              <BrandButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={onChangeCep}
                className="h-7 px-2 text-xs font-medium hover:bg-muted"
              >
                Trocar
              </BrandButton>
            </div>
          )}
        </div>

        {((!showAddressFields && !errorMessage) || errorMessage) && (
          <div className="mt-1.5 px-1">
            {errorMessage ? (
              <FieldError id={`${cepId}-description`} className="text-xs">
                {errorMessage}
              </FieldError>
            ) : !showAddressFields ? (
              <FieldDescription id={`${cepId}-description`} className="text-xs">
                {helperText ?? "Digite o CEP para buscar o endereço automaticamente"}
              </FieldDescription>
            ) : null}
          </div>
        )}
      </div>
    </Field>
  );
}
