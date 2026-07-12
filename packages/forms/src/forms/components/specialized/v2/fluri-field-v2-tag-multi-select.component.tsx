"use client";

import { ChevronDown, X, Check } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import { Badge } from "@workspace/ui/components/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import type { V2BoundFieldProps } from "@workspace/forms/v2/kernel/types";
import { V2_DROPDOWN_SIDE_OFFSET } from "@workspace/forms/components/base/v2/dropdown-layout";

export type FluriFieldV2TagMultiSelectSize = "sm" | "md" | "lg";

export interface FluriFieldV2TagMultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface FluriFieldV2TagMultiSelectProps {
  label: string;
  options: FluriFieldV2TagMultiSelectOption[];
  name?: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  onBlur?: () => void;
  triggerRef?: React.Ref<HTMLButtonElement>;
  field?: V2BoundFieldProps<string[], HTMLButtonElement>;
  placeholder?: string;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  size?: FluriFieldV2TagMultiSelectSize;
  containerClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  errorTextClassName?: string;
  disabled?: boolean;
  required?: boolean;
  isInvalid?: boolean;
  fullWidth?: boolean;
  maxSelected?: number;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

const sizeClasses = {
  sm: {
    container: "min-h-11 rounded-xl",
    trigger: "min-h-11 px-3 pt-[22px] pb-0.5 text-sm h-auto inline-flex items-center",
    label: "text-sm left-3 top-[22px]",
    labelFloating: "-translate-y-[15px] scale-[0.714]",
    labelDefault: "-translate-y-1/2 scale-100",
    chevron: "right-2.5 top-[22px]",
    badge: "text-xs px-1.5 py-0.5",
  },
  md: {
    container: "min-h-12 rounded-2xl",
    trigger: "min-h-12 px-4 pt-[26px] pb-0.5 text-base h-auto inline-flex items-center",
    label: "text-base left-4 top-[24px]",
    labelFloating: "-translate-y-[16px] scale-[0.6875]",
    labelDefault: "-translate-y-1/2 scale-100",
    chevron: "right-3 top-[24px]",
    badge: "text-xs px-2 py-0.5",
  },
  lg: {
    container: "min-h-14 rounded-2xl",
    trigger: "min-h-14 px-4 pt-[30px] pb-0.5 text-base h-auto inline-flex items-center",
    label: "text-base left-4 top-[28px]",
    labelFloating: "-translate-y-[18px] scale-[0.75]",
    labelDefault: "-translate-y-1/2 scale-100",
    chevron: "right-3.5 top-[28px]",
    badge: "text-sm px-2 py-1",
  },
} as const;

const FluriFieldV2TagMultiSelect = ({
  label,
  options,
  name,
  value: controlledValue,
  defaultValue,
  onValueChange,
  onBlur,
  triggerRef,
  field,
  placeholder: _placeholder,
  helperText,
  errorMessage,
  size = "md",
  containerClassName,
  labelClassName,
  helperTextClassName,
  errorTextClassName,
  disabled = false,
  required = false,
  isInvalid = false,
  fullWidth = false,
  maxSelected,
  emptyMessage = "Nenhum resultado encontrado",
  searchPlaceholder = "Pesquisar...",
}: FluriFieldV2TagMultiSelectProps) => {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);

  const resolvedDisabled = field?.disabled ?? disabled;
  const resolvedErrorMessage = field?.errorMessage ?? errorMessage;
  const resolvedName = field?.name ?? name;

  const isControlled = field !== undefined || controlledValue !== undefined;
  const externalValue = field ? field.value : controlledValue;
  const normalizedExternalValue = useMemo(
    () => (Array.isArray(externalValue) ? externalValue : []),
    [externalValue],
  );
  const [internalValue, setInternalValue] = useState<string[]>(() =>
    isControlled ? normalizedExternalValue : (defaultValue ?? []),
  );

  useEffect(() => {
    if (!isControlled) return;
    setInternalValue(normalizedExternalValue);
  }, [normalizedExternalValue, isControlled]);

  const currentValue = internalValue;
  const hasValue = currentValue.length > 0;
  const shouldFloatLabel = isOpen || hasValue;
  const hasError = Boolean(resolvedErrorMessage) || isInvalid;

  const byValue = useMemo(() => new Map(options.map((opt) => [opt.value, opt])), [options]);

  const selectedOptions = useMemo(() => {
    return currentValue
      .map((v) => byValue.get(v))
      .filter(Boolean) as FluriFieldV2TagMultiSelectOption[];
  }, [currentValue, byValue]);

  const handleValueChange = (nextValue: string[]) => {
    setInternalValue(nextValue);
    field?.onValueChange(nextValue);
    onValueChange?.(nextValue);
  };

  const handleSelect = (value: string) => {
    if (resolvedDisabled) return;

    const isSelected = currentValue.includes(value);
    let newValue: string[];

    if (isSelected) {
      newValue = currentValue.filter((v) => v !== value);
    } else {
      if (maxSelected && currentValue.length >= maxSelected) return;
      newValue = [...currentValue, value];
    }

    handleValueChange(newValue);
  };

  const handleRemove = (valueToRemove: string) => {
    if (resolvedDisabled) return;
    const newValue = currentValue.filter((v) => v !== valueToRemove);
    handleValueChange(newValue);
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
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="relative">
          <div
            className={cn(
              "relative bg-muted/50 border transition-all duration-200",
              hasError
                ? "border-destructive"
                : "border-transparent focus-within:ring-[3px] focus-within:ring-ring/50",
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

            <PopoverTrigger asChild>
              <div
                aria-invalid={hasError}
                aria-describedby={
                  (helperText && !hasError) || hasError ? `${id}-description` : undefined
                }
              >
                <button
                  ref={field?.ref ?? triggerRef}
                  id={id}
                  name={resolvedName}
                  type="button"
                  disabled={resolvedDisabled}
                  onBlur={() => {
                    field?.onBlur?.();
                    onBlur?.();
                  }}
                  className={cn(
                    "w-full border-0 bg-transparent shadow-none ring-0 focus:ring-0 focus:outline-none",
                    "focus-visible:ring-0 focus-visible:border-transparent focus-visible:outline-none",
                    "disabled:cursor-not-allowed text-left pr-10",
                    sizeClasses[size].trigger,
                  )}
              >
                <div className="flex flex-wrap items-center gap-1.5 w-full min-w-0">
                  {selectedOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className={cn(
                        "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20 font-medium shrink-0 rounded-full",
                        sizeClasses[size].badge,
                      )}
                    >
                      {option.label}
                      {!resolvedDisabled && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemove(option.value);
                          }}
                          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer flex items-center justify-center bg-primary-foreground/20 hover:bg-primary-foreground/40 text-primary-foreground p-0.5 appearance-none border-0"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                </button>
              </div>
            </PopoverTrigger>

            <ChevronDown
              className={cn(
                "absolute -translate-y-1/2 size-5 text-muted-foreground opacity-100 pointer-events-none transition-transform duration-200",
                sizeClasses[size].chevron,
                isOpen && "rotate-180",
              )}
            />
          </div>

          {resolvedName ? (
            <input type="hidden" name={resolvedName} value={currentValue.join(",")} />
          ) : null}

          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl max-h-[300px] overflow-hidden"
            align="start"
            sideOffset={V2_DROPDOWN_SIDE_OFFSET}
            style={dropdownStyle as React.CSSProperties}
          >
            <Command className="bg-transparent">
              <CommandInput placeholder={searchPlaceholder} className="border-b border-border/40" />
              <CommandList className="max-h-[200px]">
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = currentValue.includes(option.value);
                    const isMaxReached =
                      maxSelected !== undefined &&
                      currentValue.length >= maxSelected &&
                      !isSelected;

                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        disabled={isMaxReached}
                        onSelect={() => handleSelect(option.value)}
                        className={cn(
                          "relative flex w-full cursor-pointer items-center rounded-lg py-2.5 px-3 mb-0.5 last:mb-0 text-sm outline-hidden select-none",
                          "data-[selected=true]:bg-[var(--glass-select-item-hover)] data-[selected=true]:text-foreground",
                          isSelected &&
                            "bg-[var(--glass-select-item-active)] font-medium border border-[var(--glass-select-item-active-border)]",
                          !isSelected && "border border-transparent",
                          isMaxReached && !isSelected && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <span className="flex-1 truncate">{option.label}</span>
                        {isSelected && (
                          <span className="flex h-3.5 w-3.5 items-center justify-center text-primary shrink-0 ml-2">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </div>
      </Popover>

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

export { FluriFieldV2TagMultiSelect };
export default FluriFieldV2TagMultiSelect;
