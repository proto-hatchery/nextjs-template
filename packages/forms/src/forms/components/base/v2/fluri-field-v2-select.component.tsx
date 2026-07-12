"use client";

import { ChevronDown, X } from "lucide-react";
import { useId, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { cn } from "@workspace/ui/lib/utils";
import { resolveV2FieldError } from "@workspace/forms/v2/kernel";
import type { V2SelectFieldBinding } from "@workspace/forms/v2/rhf";
import { V2_DROPDOWN_SIDE_OFFSET } from "./dropdown-layout";

export type FluriFieldV2SelectSize = "sm" | "md" | "lg";

export interface FluriFieldV2SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FluriFieldV2SelectProps {
  label: string;
  options: FluriFieldV2SelectOption[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  onBlur?: () => void;
  selectRef?: React.Ref<HTMLButtonElement>;
  field?: V2SelectFieldBinding;
  selectedLabelByValue?: Record<string, string>;
  placeholder?: string;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  size?: FluriFieldV2SelectSize;
  containerClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  errorTextClassName?: string;
  showClearButton?: boolean;
  disabled?: boolean;
  required?: boolean;
  isInvalid?: boolean;
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: {
    container: "h-11 rounded-xl",
    trigger: "h-11 px-3 pt-6 pb-0.5 text-sm",
    triggerWithClear: "pr-12",
    label: "text-sm left-3 top-1/2",
    labelFloating: "-translate-y-[18px] scale-[0.714]",
    labelDefault: "-translate-y-1/2 scale-100",
    clearButton: "right-10",
    chevron: "right-2.5",
  },
  md: {
    container: "h-12 rounded-2xl",
    trigger: "h-12 px-4 pt-7 pb-1 text-base",
    triggerWithClear: "pr-12",
    label: "text-base left-4 top-1/2",
    labelFloating: "-translate-y-[18px] scale-[0.6875]",
    labelDefault: "-translate-y-1/2 scale-100",
    clearButton: "right-10",
    chevron: "right-3",
  },
  lg: {
    container: "h-14 rounded-2xl",
    trigger: "h-14 px-4 pt-7 pb-1 text-base",
    triggerWithClear: "pr-12",
    label: "text-base left-4 top-1/2",
    labelFloating: "-translate-y-5 scale-[0.75]",
    labelDefault: "-translate-y-1/2 scale-100",
    clearButton: "right-10",
    chevron: "right-3.5",
  },
} as const;

const toOptionalValue = (value: string | undefined | null): string | undefined => {
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }

  return value;
};

const FluriFieldV2Select = ({
  label,
  options,
  name,
  value: controlledValue,
  defaultValue,
  onValueChange,
  onBlur,
  selectRef,
  field,
  selectedLabelByValue,
  placeholder: _placeholder,
  helperText,
  errorMessage,
  size = "md",
  containerClassName,
  labelClassName,
  helperTextClassName,
  errorTextClassName,
  showClearButton = true,
  disabled = false,
  required = false,
  isInvalid = false,
  fullWidth = false,
}: FluriFieldV2SelectProps) => {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);

  const resolvedDisabled = field?.disabled ?? disabled;
  const resolvedErrorMessage = resolveV2FieldError(field?.errorMessage) ?? errorMessage;
  const resolvedName = field?.name ?? name;

  const isControlled = field !== undefined || controlledValue !== undefined;
  const externalValue = toOptionalValue(field ? field.value : controlledValue);
  const [internalValue, setInternalValue] = useState<string | undefined>(
    toOptionalValue(defaultValue),
  );

  // When controlled, always use external value; when uncontrolled, use internal state
  const currentValue = isControlled ? externalValue : internalValue;
  const radixValue = currentValue ?? "";
  const hasValue = Boolean(currentValue);
  const shouldFloatLabel = isOpen || hasValue;
  const hasError = Boolean(resolvedErrorMessage) || isInvalid;

  const handleValueChange = (nextValue: string) => {
    const finalValue = toOptionalValue(nextValue);
    if (!isControlled) {
      setInternalValue(finalValue);
    }

    field?.onValueChange(finalValue);
    onValueChange?.(finalValue);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    handleValueChange("");
  };

  const dropdownStyle = {
    background: [
      "radial-gradient(120% 130% at 6% 0%, color-mix(in oklab, var(--primary) 8%, transparent), transparent 60%)",
      "radial-gradient(130% 120% at 100% 100%, color-mix(in oklab, var(--accent) 8%, transparent), transparent 62%)",
      "color-mix(in oklab, var(--background) 12%, transparent)",
    ].join(", "),
    borderColor: "var(--glass-select-border)",
    boxShadow:
      "0 10px 24px -22px color-mix(in srgb, black 36%, transparent), inset 0 0 0 1px color-mix(in oklab, var(--glass-select-border) 45%, transparent)",
    backdropFilter: "var(--glass-select-backdrop)",
    WebkitBackdropFilter: "var(--glass-select-backdrop)",
    "--tw-enter-translate-x": "0px",
    "--tw-enter-translate-y": "0px",
    "--tw-enter-scale": "1",
    "--tw-enter-rotate": "0deg",
  };

  return (
    <Field
      data-invalid={hasError}
      data-disabled={resolvedDisabled}
      data-size={size}
      className={cn(fullWidth ? "w-full" : "max-w-xs", containerClassName)}
    >
      <Select
        value={radixValue}
        onValueChange={handleValueChange}
        open={isOpen}
        onOpenChange={setIsOpen}
        disabled={resolvedDisabled}
      >
        <div className="relative">
          <div
            className={cn(
              "relative bg-muted/50 border border-transparent transition-all duration-200",
              hasError && "border-destructive",
              resolvedDisabled && "opacity-50 cursor-not-allowed",
              sizeClasses[size].container,
            )}
          >
            <FieldLabel
              htmlFor={id}
              aria-required={required}
              className={cn(
                "absolute pointer-events-none text-muted-foreground transition-[transform,color] duration-200 ease-out origin-top-left transform-gpu will-change-transform z-[1]",
                sizeClasses[size].label,
                shouldFloatLabel ? sizeClasses[size].labelFloating : sizeClasses[size].labelDefault,
                shouldFloatLabel && "text-muted-foreground/80 font-semibold",
                labelClassName,
              )}
            >
              {label}
            </FieldLabel>

            <SelectTrigger
              ref={field?.ref ?? selectRef}
              id={id}
              name={resolvedName}
              onBlur={() => {
                field?.onBlur?.();
                onBlur?.();
              }}
              className={cn(
                "w-full border-0 bg-transparent shadow-none ring-0 focus:ring-0 focus:outline-none rounded-none",
                "focus-visible:ring-0 focus-visible:border-transparent focus-visible:outline-none",
                "disabled:cursor-not-allowed gap-1",
                sizeClasses[size].trigger,
                showClearButton && hasValue && sizeClasses[size].triggerWithClear,
                "*:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:min-w-0",
              )}
              aria-invalid={hasError}
              aria-describedby={
                (helperText && !hasError) || hasError ? `${id}-description` : undefined
              }
            >
              <SelectValue placeholder="" />
            </SelectTrigger>
            <ChevronDown
              className={cn(
                "absolute top-1/2 -translate-y-1/2 size-5 text-muted-foreground opacity-100 pointer-events-none transition-transform duration-200",
                sizeClasses[size].chevron,
                isOpen && "rotate-180",
              )}
            />
            {showClearButton && hasValue && !resolvedDisabled && (
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={handleClear}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 p-1 rounded-full z-10",
                  "text-muted-foreground/60 hover:text-foreground hover:bg-muted",
                  "transition-colors focus:outline-none",
                  sizeClasses[size].clearButton,
                )}
                aria-label="Limpar seleção"
                tabIndex={-1}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {resolvedName ? <input type="hidden" name={resolvedName} value={radixValue} /> : null}

          <SelectContent
            position="popper"
            sideOffset={V2_DROPDOWN_SIDE_OFFSET}
            align="start"
            className="min-w-[var(--radix-select-trigger-width)] rounded-xl max-h-[300px]"
            style={dropdownStyle as React.CSSProperties}
          >
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                {...(option.disabled !== undefined ? { disabled: option.disabled } : {})}
                className={cn(
                  "rounded-lg py-2.5 px-3",
                  "data-[highlighted]:[background:var(--glass-select-item-hover)]",
                  "data-[state=checked]:[background:var(--glass-select-item-active)]",
                  "data-[state=checked]:[border-color:var(--glass-select-item-active-border)]",
                )}
              >
                {selectedLabelByValue?.[option.value] ?? option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </div>
      </Select>

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
    </Field>
  );
};

export { FluriFieldV2Select };
export default FluriFieldV2Select;
