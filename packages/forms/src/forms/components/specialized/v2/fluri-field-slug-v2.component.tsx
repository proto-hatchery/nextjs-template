"use client";

import { CheckCircle2, Globe, Loader2, XCircle } from "lucide-react";
import * as React from "react";
import { useId, useRef, useState, useCallback, useEffect } from "react";

import { Field, FieldDescription, FieldError } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { useDebouncedCallback } from "@workspace/forms/hooks/use-debounced-callback";
import { cn } from "@workspace/ui/lib/utils";
import type { V2InputFieldBinding } from "@workspace/forms/v2/rhf";
import {
  normalizeSlug,
  validateSlug,
  SLUG_MAX_LENGTH as DEFAULT_MAX_LENGTH,
  SLUG_MIN_LENGTH as DEFAULT_MIN_LENGTH,
} from "@workspace/forms/lib/slug-validation";

export interface FluriFieldSlugV2Props extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "value" | "onChange"
> {
  label?: string;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  errorTextClassName?: string;
  isInvalid?: boolean;
  fullWidth?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  /**
   * Function to check if the slug is available.
   * Should return an object with `available` boolean and optional `error` string.
   */
  checkAvailability?: (slug: string) => Promise<{ available: boolean; error?: string }>;
  /**
   * Maximum length for the slug
   * @default 30
   */
  maxLength?: number;
  /**
   * Minimum length for the slug
   * @default 3
   */
  minLength?: number;
  /**
   * URL prefix to display before the input
   * @default "me.fluri.com.br/"
   */
  urlPrefix?: string;
  /**
   * Field contract for React Hook Form integration
   */
  field?: V2InputFieldBinding;
  /**
   * Controlled value
   */
  value?: string;
  /**
   * Change handler
   */
  onValueChange?: (value: string) => void;
  /**
   * Debounce delay for availability check in ms
   * @default 500
   */
  debounceDelay?: number;
}

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const FluriFieldSlugV2 = ({
  className,
  label: _label = "URL do perfil",
  helperText,
  errorMessage,
  containerClassName,
  labelClassName: _labelClassName,
  helperTextClassName,
  errorTextClassName,
  disabled = false,
  required: _required = false,
  isInvalid = false,
  fullWidth = false,
  inputRef,
  checkAvailability,
  maxLength = DEFAULT_MAX_LENGTH,
  minLength = DEFAULT_MIN_LENGTH,
  urlPrefix = "me.fluri.com.br/",
  field,
  value: controlledValue,
  onValueChange,
  debounceDelay = 500,
  placeholder = "seu-nome",
  autoComplete = "off",
  ...props
}: FluriFieldSlugV2Props) => {
  const id = useId();
  const internalInputRef = useRef<HTMLInputElement>(null);
  const fieldRef = field?.ref;

  const [status, setStatus] = useState<SlugStatus>("idle");
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const isControlled = field !== undefined || controlledValue !== undefined;
  const currentValue = field ? field.value : isControlled ? controlledValue : "";

  const resolvedDisabled = field?.disabled ?? disabled;
  const resolvedErrorMessage =
    field?.errorMessage ?? errorMessage ?? availabilityError ?? undefined;
  const hasError =
    Boolean(resolvedErrorMessage) || isInvalid || status === "taken" || status === "invalid";

  // Merge refs
  const setMergedRef = useCallback(
    (node: HTMLInputElement | null) => {
      internalInputRef.current = node;

      if (inputRef) {
        if (typeof inputRef === "function") {
          inputRef(node);
        } else {
          (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      }

      if (fieldRef) {
        if (typeof fieldRef === "function") {
          fieldRef(node);
        } else {
          (fieldRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      }
    },
    [inputRef, fieldRef],
  );

  // Validation function
  const validateAndSetError = useCallback(
    (value: string): boolean => {
      // Check length constraints first
      if (value.length < minLength) {
        setStatus("invalid");
        setAvailabilityError(`Mínimo ${minLength} caracteres`);
        return false;
      }
      if (value.length > maxLength) {
        setStatus("invalid");
        setAvailabilityError(`Máximo ${maxLength} caracteres`);
        return false;
      }

      const result = validateSlug(value);
      if (!result.valid) {
        setStatus("invalid");
        setAvailabilityError(result.error ?? "URL inválida");
        return false;
      }
      return true;
    },
    [minLength, maxLength],
  );

  // Debounced availability check
  const checkSlugDebounced = useDebouncedCallback(async (candidate: string) => {
    // Validate before checking availability
    if (!validateAndSetError(candidate)) {
      return;
    }

    if (!checkAvailability) {
      setStatus("available");
      setAvailabilityError(null);
      return;
    }

    setStatus("checking");

    try {
      const result = await checkAvailability(candidate);

      if (result.error) {
        setStatus("invalid");
        setAvailabilityError(result.error);
        return;
      }

      if (!result.available) {
        setStatus("taken");
        setAvailabilityError("Esta URL já está em uso.");
        return;
      }

      setStatus("available");
      setAvailabilityError(null);
    } catch {
      setStatus("invalid");
      setAvailabilityError("Erro ao verificar disponibilidade. Tente novamente.");
    }
  }, debounceDelay);

  // Effect to check availability when value changes
  useEffect(() => {
    if (!currentValue || currentValue.length === 0) {
      setStatus("idle");
      setAvailabilityError(null);
      return;
    }

    // Check if we have enough characters to validate
    if (currentValue.length < minLength) {
      setStatus("idle");
      setAvailabilityError(null);
      return;
    }

    // Validate and then check availability
    setStatus("checking");
    void checkSlugDebounced(currentValue);
  }, [currentValue, minLength, checkSlugDebounced]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;

    // Enforce max length on raw input (before normalization)
    if (rawValue.length > maxLength) {
      return;
    }

    // Normalize the input
    const normalized = normalizeSlug(rawValue);

    // Call form library handlers
    field?.onValueChange(normalized);
    onValueChange?.(normalized);

    // Clear error while typing
    if (status !== "idle") {
      setStatus("idle");
      setAvailabilityError(null);
    }
  };

  // Get helper text content based on state
  const getHelperContent = (): { type: "error" | "helper"; content: React.ReactNode } | null => {
    if (hasError && resolvedErrorMessage) {
      return {
        type: "error",
        content: resolvedErrorMessage,
      };
    }

    // Show character count when user starts typing
    if (currentValue && currentValue.length > 0) {
      return {
        type: "helper",
        content: `${currentValue.length}/${maxLength} caracteres. Use letras minúsculas, números e hífens.`,
      };
    }

    if (helperText) {
      return {
        type: "helper",
        content: helperText,
      };
    }

    return null;
  };

  const helperContent = getHelperContent();

  return (
    <Field
      data-invalid={hasError}
      data-disabled={resolvedDisabled}
      className={cn(fullWidth ? "w-full" : "max-w-md", containerClassName)}
    >
      <div className="relative p-[3px] overflow-visible">
        <div
          className={cn(
            "relative flex items-center w-full rounded-2xl border transition-all duration-200",
            "bg-muted/50 focus-within:ring-[3px]",
            hasError
              ? "border-destructive focus-within:ring-destructive/40"
              : "border-transparent focus-within:ring-ring/50",
            resolvedDisabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {/* URL Prefix */}
          <div className="flex items-center pl-4 pr-2 py-3 select-none shrink-0">
            <Globe className="size-4 text-muted-foreground/60 mr-2" />
            <span className="text-muted-foreground font-medium text-sm">{urlPrefix}</span>
          </div>

          {/* Input */}
          <Input
            ref={setMergedRef}
            id={id}
            name={field?.name ?? props.name}
            value={currentValue ?? ""}
            onChange={handleChange}
            onBlur={() => {
              field?.onBlur?.();
            }}
            disabled={resolvedDisabled}
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={maxLength}
            className={cn(
              "peer flex-1 border-0 bg-transparent p-0 h-11 text-base font-medium",
              "text-foreground placeholder:text-muted-foreground/40",
              "focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none rounded-r-2xl",
              className,
            )}
            aria-invalid={hasError}
            aria-describedby={helperContent ? `${id}-description` : undefined}
            {...props}
          />

          {/* Status Icons */}
          <div className="flex items-center pr-4 shrink-0">
            {status === "checking" && (
              <Loader2 className="size-4 animate-spin text-muted-foreground/50" />
            )}
            {status === "available" && <CheckCircle2 className="size-4 text-emerald-500" />}
            {hasError && status !== "checking" && <XCircle className="size-4 text-destructive" />}
          </div>
        </div>

        {/* Helper / Error Text - Following Field v2 pattern exactly */}
        {helperContent && (
          <div className="mt-1.5 px-1">
            {helperContent.type === "error" ? (
              <FieldError id={`${id}-description`} className={cn("text-xs", errorTextClassName)}>
                {helperContent.content}
              </FieldError>
            ) : (
              <FieldDescription
                id={`${id}-description`}
                className={cn("text-xs", helperTextClassName)}
              >
                {helperContent.content}
              </FieldDescription>
            )}
          </div>
        )}
      </div>
    </Field>
  );
};

export { FluriFieldSlugV2 };
export default FluriFieldSlugV2;
