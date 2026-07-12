"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { cn } from "@workspace/ui/lib/utils";
import type { V2SearchSelectFieldBinding } from "@workspace/forms/v2/rhf";
import { V2_DROPDOWN_SIDE_OFFSET } from "./dropdown-layout";
import type { FluriFieldV2SelectOption, FluriFieldV2SelectSize } from "./fluri-field-v2-select.component";

export interface FluriFieldV2SelectWithSearchProps {
  label: string;
  options: FluriFieldV2SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
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
  filterFunction?: (option: FluriFieldV2SelectOption, query: string) => boolean;
  onSearchChange?: (query: string) => void;
  selectedLabelByValue?: Record<string, string>;
  renderOption?: (option: FluriFieldV2SelectOption, selected: boolean) => React.ReactNode;
  dropdownWidth?: number | string;
  name?: string;
  onBlur?: () => void;
  triggerRef?: React.Ref<HTMLButtonElement>;
  field?: V2SearchSelectFieldBinding;
}

// Layout: [ conteúdo ] [ clear ] [ chevron no end ]
// Gap label/conteúdo alinhado com FluriFieldV2Input - não adicionar pt extra
const sizeClasses = {
  sm: {
    container: "h-11 rounded-xl",
    trigger: "h-11 px-3 pt-4.5 pb-0.5 text-sm",
    triggerWithClear: "pr-12",
    label: "text-sm left-3 top-1/2",
    labelFloating: "-translate-y-[18px] scale-[0.714]",
    labelDefault: "-translate-y-1/2 scale-100",
    clearButton: "right-10",
    chevron: "right-2.5",
  },
  md: {
    container: "h-12 rounded-2xl",
    trigger: "h-12 px-4 pt-5 pb-1 text-base",
    triggerWithClear: "pr-12",
    label: "text-base left-4 top-1/2",
    labelFloating: "-translate-y-[18px] scale-[0.6875]",
    labelDefault: "-translate-y-1/2 scale-100",
    clearButton: "right-10",
    chevron: "right-3",
  },
  lg: {
    container: "h-14 rounded-2xl",
    trigger: "h-14 px-4 pt-5.5 pb-1 text-base",
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

const dropdownStyle: React.CSSProperties = {
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
};

const defaultFilter = (option: FluriFieldV2SelectOption, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    option.label.toLowerCase().includes(normalized) ||
    option.value.toLowerCase().includes(normalized)
  );
};

const FluriFieldV2SelectWithSearch = ({
  label,
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado",
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
  filterFunction = defaultFilter,
  onSearchChange,
  selectedLabelByValue,
  renderOption,
  dropdownWidth,
  name,
  onBlur,
  triggerRef: triggerRefProp,
  field,
}: FluriFieldV2SelectWithSearchProps) => {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerWidth, setTriggerWidth] = useState<number>();

  const resolvedDisabled = field?.disabled ?? disabled;
  const resolvedErrorMessage = field?.errorMessage ?? errorMessage;
  const resolvedName = field?.name ?? name;

  const isControlled = field !== undefined || controlledValue !== undefined;
  const externalValue = toOptionalValue(field ? field.value : controlledValue);
  const [internalValue, setInternalValue] = useState<string | undefined>(() =>
    isControlled ? externalValue : (externalValue ?? toOptionalValue(defaultValue)),
  );

  useEffect(() => {
    if (!isControlled) return;
    setInternalValue(externalValue);
  }, [externalValue, isControlled]);

  const currentValue = internalValue;
  const hasValue = Boolean(currentValue);
  const shouldFloatLabel = isOpen || hasValue;
  const hasError = Boolean(resolvedErrorMessage) || isInvalid;
  const selectedOption = currentValue
    ? options.find((option) => option.value === currentValue)
    : undefined;
  const selectedDisplayLabel =
    (currentValue ? selectedLabelByValue?.[currentValue] : undefined) ?? selectedOption?.label;

  const filteredOptions = useMemo(
    () => options.filter((option) => filterFunction(option, searchQuery)),
    [options, filterFunction, searchQuery],
  );

  const handleValueChange = (nextValue: string | undefined) => {
    const finalValue = toOptionalValue(nextValue);
    setInternalValue(finalValue);
    field?.onValueChange(finalValue);
    onValueChange?.(finalValue);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const width = triggerRef.current?.offsetWidth;
    if (width) {
      setTriggerWidth(width);
    }
  }, [isOpen]);

  return (
    <Field
      data-invalid={hasError}
      data-disabled={resolvedDisabled}
      data-size={size}
      className={cn(fullWidth ? "w-full" : "max-w-xs", containerClassName)}
    >
      <PopoverPrimitive.Root
        open={isOpen}
        onOpenChange={(next) => {
          setIsOpen(next);
          if (!next) setSearchQuery("");
        }}
      >
        <div className="relative">
          <div
            className={cn(
              "relative bg-muted/50 transition-all duration-200",
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

            <PopoverPrimitive.Trigger asChild>
              <div
                aria-invalid={hasError}
                aria-describedby={
                  (helperText && !hasError) || hasError ? `${id}-description` : undefined
                }
              >
                <button
                  id={id}
                  ref={(node) => {
                    triggerRef.current = node;
                    if (typeof triggerRefProp === "function") {
                      triggerRefProp(node);
                    } else if (triggerRefProp && "current" in triggerRefProp) {
                      (triggerRefProp as React.MutableRefObject<HTMLButtonElement | null>).current =
                        node;
                    }

                    if (typeof field?.ref === "function") {
                      field.ref(node);
                    } else if (field?.ref && "current" in field.ref) {
                      (field.ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
                    }
                  }}
                  type="button"
                  name={resolvedName}
                  disabled={resolvedDisabled}
                  onBlur={() => {
                    field?.onBlur?.();
                    onBlur?.();
                  }}
                  className={cn(
                    "w-full flex items-center justify-between text-left",
                    "bg-transparent border-0 shadow-none ring-0 focus:ring-0 focus:outline-none",
                    "disabled:cursor-not-allowed",
                    "text-foreground placeholder:text-muted-foreground",
                    sizeClasses[size].trigger,
                    showClearButton && hasValue && sizeClasses[size].triggerWithClear,
                  )}
                >
                  <span className={cn(!hasValue && "text-muted-foreground")}>
                    {selectedDisplayLabel || (isOpen ? placeholder : "\u00A0")}
                  </span>
                </button>
              </div>
            </PopoverPrimitive.Trigger>

            <ChevronDown
              className={cn(
                "absolute top-1/2 -translate-y-1/2 size-5 text-muted-foreground opacity-100 transition-transform duration-200 pointer-events-none",
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchQuery("");
                  handleValueChange(undefined);
                }}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 p-1 rounded-full shrink-0",
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
          {resolvedName ? (
            <input type="hidden" name={resolvedName} value={currentValue ?? ""} />
          ) : null}

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              className={cn(
                "z-[2000] max-h-[300px] overflow-hidden rounded-xl border p-0 outline-none",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "data-[side=bottom]:slide-in-from-top-2",
              )}
              sideOffset={V2_DROPDOWN_SIDE_OFFSET}
              align="start"
              style={{
                ...dropdownStyle,
                width:
                  dropdownWidth !== undefined
                    ? typeof dropdownWidth === "number"
                      ? `${dropdownWidth}px`
                      : dropdownWidth
                    : triggerWidth,
              }}
            >
              <div className="border-b px-2 py-1.5">
                <div className="flex items-center gap-2 px-2.5 py-1.5">
                  <Search className="size-4 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      onSearchChange?.(event.target.value);
                    }}
                    placeholder={searchPlaceholder}
                    className="w-full bg-transparent text-sm outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="max-h-[240px] overflow-y-auto p-1.5">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleValueChange(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        "relative flex w-full items-center rounded-lg py-2.5 px-3 text-left text-sm transition-[color,background-color,border-color] duration-150",
                        "text-foreground/90 border border-transparent",
                        "hover:text-foreground hover:[background:var(--glass-select-item-hover)]",
                        currentValue === option.value &&
                          "[background:var(--glass-select-item-active)] [border-color:var(--glass-select-item-active-border)]",
                        option.disabled && "pointer-events-none opacity-50",
                      )}
                    >
                      {renderOption ? (
                        <span className="flex w-full items-center">
                          {renderOption(option, currentValue === option.value)}
                        </span>
                      ) : (
                        <>
                          <span className="flex-1">{option.label}</span>
                          {currentValue === option.value ? (
                            <span
                              className="size-1.5 rounded-full"
                              style={{
                                backgroundColor: "var(--primary)",
                                boxShadow:
                                  "0 0 0 3px color-mix(in oklab, var(--primary) 22%, transparent)",
                              }}
                            />
                          ) : null}
                        </>
                      )}
                    </button>
                  ))
                )}
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </div>
      </PopoverPrimitive.Root>

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

export { FluriFieldV2SelectWithSearch };
export default FluriFieldV2SelectWithSearch;
