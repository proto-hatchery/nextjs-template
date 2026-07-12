"use client";

import { X } from "lucide-react";
import * as React from "react";
import { useId, useRef, useState } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { resolveV2FieldError } from "@workspace/forms/v2/kernel";
import type { V2InputFieldBinding } from "@workspace/forms/v2/rhf";

export type FluriFieldV2InputSize = "sm" | "md" | "lg";

export interface FluriFieldV2InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  size?: FluriFieldV2InputSize;
  containerClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  errorTextClassName?: string;
  showClearButton?: boolean;
  isInvalid?: boolean;
  fullWidth?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  onValueChange?: (value: string) => void;
  preventAutoFocus?: boolean;
  field?: V2InputFieldBinding;
}

const sizeClasses = {
  sm: {
    container: "h-11 rounded-xl",
    input: "h-11 px-3 pt-4.5 pb-0.5 text-sm",
    label: "text-sm left-3",
    labelFloating: "text-[10px] top-1",
    labelDefault: "top-1/2 -translate-y-1/2",
    clearButton: "right-2.5",
  },
  md: {
    container: "h-12 rounded-2xl",
    input: "h-12 px-4 pt-5 pb-1 text-base",
    label: "text-base left-4",
    labelFloating: "text-[11px] top-1.5",
    labelDefault: "top-1/2 -translate-y-1/2",
    clearButton: "right-3",
  },
  lg: {
    container: "h-14 rounded-2xl",
    input: "h-14 px-4 pt-5.5 pb-1 text-base",
    label: "text-base left-4",
    labelFloating: "text-xs top-2",
    labelDefault: "top-1/2 -translate-y-1/2",
    clearButton: "right-3.5",
  },
} as const;

const FluriFieldV2Input = ({
  className,
  label,
  helperText,
  errorMessage,
  size = "md",
  containerClassName,
  labelClassName,
  helperTextClassName,
  errorTextClassName,
  showClearButton: showClearButtonProp = false,
  disabled = false,
  required = false,
  isInvalid = false,
  fullWidth = false,
  inputRef,
  onValueChange,
  preventAutoFocus,
  field,
  value: controlledValue,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  type = "text",
  placeholder = " ",
  ...props
}: FluriFieldV2InputProps) => {
  const showClearButton = showClearButtonProp;

  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  // Handle preventAutoFocus
  const fieldRef = field?.ref;
  const setMergedRef = React.useCallback(
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

      // If preventAutoFocus is true, blur the element if it was automatically focused
      if (preventAutoFocus && node && document.activeElement === node) {
        node.blur();
      }
    },
    [inputRef, fieldRef, preventAutoFocus],
  );

  // Sync focus state with focusin/focusout (bubble) - fixes desync when password manager
  // steals focus and returns it without firing React's onFocus
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleFocusIn = (e: FocusEvent) => {
      if (el.contains(e.target as Node)) {
        setIsFocused(true);
      }
    };
    const handleFocusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node)) {
        setIsFocused(false);
      }
    };

    el.addEventListener("focusin", handleFocusIn);
    el.addEventListener("focusout", handleFocusOut);
    return () => {
      el.removeEventListener("focusin", handleFocusIn);
      el.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const resolvedDisabled = field?.disabled ?? disabled;
  const resolvedErrorMessage = resolveV2FieldError(field?.errorMessage) ?? errorMessage;
  const resolvedName = field?.name ?? props.name;

  const isControlled = field !== undefined || controlledValue !== undefined;
  const currentValue = field ? field.value : isControlled ? controlledValue : internalValue;
  const hasValue = String(currentValue ?? "").length > 0;
  const shouldFloatLabel = isFocused || hasValue;
  const hasError = Boolean(resolvedErrorMessage) || isInvalid;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    const nextValue = event.target.value;
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    field?.onValueChange(nextValue);
    onValueChange?.(nextValue);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue("");
    }

    const eventTarget = {
      target: { value: "" },
      currentTarget: { value: "" },
    };
    const event = eventTarget as React.ChangeEvent<HTMLInputElement>;

    field?.onValueChange("");
    onValueChange?.("");
    onChange?.(event);
  };

  return (
    <Field
      data-invalid={hasError}
      data-disabled={resolvedDisabled}
      data-size={size}
      className={cn(fullWidth ? "w-full" : "max-w-xs", containerClassName)}
    >
      <div ref={containerRef} className="relative p-[3px] -m-[3px] overflow-visible">
        <div
          className={cn(
            "relative bg-muted/50 border border-transparent transition-all duration-200",
            "focus-within:ring-[3px] focus-within:ring-ring/50",
            hasError && "border-destructive",
            hasError && "focus-within:ring-destructive/40",
            resolvedDisabled && "opacity-50 cursor-not-allowed",
            sizeClasses[size].container,
          )}
        >
          <FieldLabel
            htmlFor={id}
            aria-required={required}
            className={cn(
              "absolute pointer-events-none text-muted-foreground transition-all duration-200 ease-out origin-left",
              sizeClasses[size].label,
              shouldFloatLabel ? sizeClasses[size].labelFloating : sizeClasses[size].labelDefault,
              shouldFloatLabel && "text-muted-foreground/80 font-semibold",
              labelClassName,
            )}
          >
            {label ?? "\u00A0"}
          </FieldLabel>

          <Input
            ref={setMergedRef}
            id={id}
            name={resolvedName}
            type={type}
            value={currentValue}
            onChange={handleChange}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              field?.onBlur?.();
              onBlur?.(event);
            }}
            disabled={resolvedDisabled}
            placeholder={placeholder}
            className={cn(
              "w-full border-0 bg-transparent shadow-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-transparent focus:placeholder:text-muted-foreground/50",
              sizeClasses[size].input,
              showClearButton && hasValue ? "pr-10" : undefined,
              className,
            )}
            aria-invalid={hasError}
            aria-describedby={
              (helperText && !hasError) || hasError ? `${id}-description` : undefined
            }
            {...Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined))}
          />

          {showClearButton && hasValue && !resolvedDisabled && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 p-1 rounded-full",
                "text-muted-foreground/60 hover:text-foreground hover:bg-muted",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50",
                sizeClasses[size].clearButton,
              )}
              aria-label="Limpar campo"
              tabIndex={-1}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {(helperText || resolvedErrorMessage) && (
          <div className="mt-1.5 px-1">
            {hasError && resolvedErrorMessage ? (
              <FieldError id={`${id}-description`} className={cn("text-xs", errorTextClassName)}>
                {resolvedErrorMessage}
              </FieldError>
            ) : helperText ? (
              <FieldDescription
                id={`${id}-description`}
                className={cn("text-xs", helperTextClassName)}
              >
                {helperText}
              </FieldDescription>
            ) : null}
          </div>
        )}
      </div>
    </Field>
  );
};

export { FluriFieldV2Input };
export default FluriFieldV2Input;
