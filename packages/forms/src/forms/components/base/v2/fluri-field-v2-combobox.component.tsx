"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { cn } from "@workspace/ui/lib/utils";
import type { V2PatientFieldBinding } from "@workspace/forms/v2/rhf";
import { V2_DROPDOWN_SIDE_OFFSET } from "./dropdown-layout";
import type { FluriFieldV2SelectOption, FluriFieldV2SelectSize } from "./fluri-field-v2-select.component";

export interface FluriFieldV2ComboboxProps {
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  inputRef?: React.Ref<HTMLInputElement>;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  renderSelected?: (option: FluriFieldV2SelectOption) => React.ReactNode;
  renderSelectedAccessory?: (option: FluriFieldV2SelectOption) => React.ReactNode;
  renderOption?: (option: FluriFieldV2SelectOption, selected: boolean) => React.ReactNode;
  field?: V2PatientFieldBinding;
}

// Layout: [ conteúdo ] [ avatar/acessório ] [ clear ] [ chevron no end ]
// Acessório mais à esquerda para não sobrepor o clear
const sizeClasses = {
  sm: {
    container: "h-11 rounded-xl",
    input: "h-11 px-3 pt-4.5 pb-0.5 text-sm",
    selectedOverlay: "left-3 right-12 top-0 h-11 px-3 pt-4.5 pb-0.5 text-sm",
    label: "text-sm left-3 top-1/2",
    labelFloating: "-translate-y-[18px] scale-[0.714]",
    labelDefault: "-translate-y-1/2 scale-100",
    clearButton: "right-10",
    accessoryWithClear: "right-[4.5rem]",
    accessoryWithoutClear: "right-8",
    chevron: "right-2.5",
  },
  md: {
    container: "h-12 rounded-2xl",
    input: "h-12 px-4 pt-5 pb-1 text-base",
    selectedOverlay: "left-4 right-12 top-0 h-12 px-4 pt-5 pb-1 text-base",
    label: "text-base left-4 top-1/2",
    labelFloating: "-translate-y-[18px] scale-[0.6875]",
    labelDefault: "-translate-y-1/2 scale-100",
    clearButton: "right-10",
    accessoryWithClear: "right-[4.5rem]",
    accessoryWithoutClear: "right-9",
    chevron: "right-3",
  },
  lg: {
    container: "h-14 rounded-2xl",
    input: "h-14 px-4 pt-5.5 pb-1 text-base",
    selectedOverlay: "left-4 right-12 top-0 h-14 px-4 pt-5.5 pb-1 text-base",
    label: "text-base left-4 top-1/2",
    labelFloating: "-translate-y-5 scale-[0.75]",
    labelDefault: "-translate-y-1/2 scale-100",
    clearButton: "right-10",
    accessoryWithClear: "right-[4.5rem]",
    accessoryWithoutClear: "right-10",
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

const FluriFieldV2Combobox = ({
  label,
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  placeholder: _placeholder = "Selecione...",
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
  open: controlledOpen,
  onOpenChange,
  inputRef,
  name,
  onBlur,
  renderSelected,
  renderSelectedAccessory,
  renderOption,
  field,
}: FluriFieldV2ComboboxProps) => {
  const id = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputElementRef = useRef<HTMLInputElement | null>(null);
  const skipCloseSyncRef = useRef(false);
  const suppressNextFocusRef = useRef(false);
  const isControlled = field !== undefined || controlledValue !== undefined;
  const externalValue = toOptionalValue(field ? field.value : controlledValue);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | undefined>(() =>
    isControlled ? externalValue : (externalValue ?? toOptionalValue(defaultValue)),
  );
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentWidth, setContentWidth] = useState<number>();

  const resolvedDisabled = field?.disabled ?? disabled;
  const resolvedErrorMessage = field?.errorMessage ?? errorMessage;
  const resolvedName = field?.name ?? name;
  const forwardedInputRef = inputRef;
  const fieldInputRef = field?.ref;
  const isOpen = controlledOpen ?? uncontrolledOpen;

  useEffect(() => {
    if (!isControlled) return;
    setInternalValue(externalValue);
  }, [externalValue, isControlled]);

  const selectedValue = internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  const hasValue = Boolean(selectedValue) || searchQuery.length > 0;
  const shouldFloatLabel = isOpen || isFocused || hasValue;
  const hasError = Boolean(resolvedErrorMessage) || isInvalid;
  const hasSelectedCustomContent = Boolean(!isOpen && selectedOption && renderSelected);
  const hasSelectedAccessory = Boolean(!isOpen && selectedOption && renderSelectedAccessory);
  const hasVisibleClearButton = showClearButton && hasValue && !resolvedDisabled;

  const displayedText = isOpen ? searchQuery : selectedOption?.label ? selectedOption.label : "";

  const filteredOptions = useMemo(
    () => options.filter((option) => filterFunction(option, searchQuery)),
    [options, filterFunction, searchQuery],
  );

  useEffect(() => {
    if (!isOpen) return;
    const width = inputElementRef.current?.offsetWidth;
    if (width) {
      setContentWidth(width);
    }
  }, [isOpen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocusIn = (event: FocusEvent) => {
      if (container.contains(event.target as Node)) {
        setIsFocused(true);
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      if (!container.contains(event.relatedTarget as Node)) {
        setIsFocused(false);
      }
    };

    container.addEventListener("focusin", handleFocusIn);
    container.addEventListener("focusout", handleFocusOut);

    return () => {
      container.removeEventListener("focusin", handleFocusIn);
      container.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const commitValue = (nextValue: string | undefined) => {
    const finalValue = toOptionalValue(nextValue);
    setInternalValue(finalValue);

    if (field) {
      const nextFieldValue: string = finalValue ?? "";
      field.onValueChange(nextFieldValue);
    }
    onValueChange?.(finalValue);
  };

  const syncSearchOnClose = (nextValue: string | undefined) => {
    if (!nextValue) {
      setSearchQuery("");
      return;
    }

    const option = options.find((candidate) => candidate.value === nextValue);
    if (option) {
      setSearchQuery(option.label);
    } else {
      setSearchQuery("");
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearchChange?.("");
    commitValue(undefined);
  };

  const handleSelect = (nextValue: string) => {
    commitValue(nextValue);
    syncSearchOnClose(nextValue);
    onSearchChange?.("");
    setIsFocused(false);
    suppressNextFocusRef.current = true;
    skipCloseSyncRef.current = true;
    inputElementRef.current?.blur();
    handleOpenChange(false);
    requestAnimationFrame(() => {
      suppressNextFocusRef.current = false;
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      if (skipCloseSyncRef.current) {
        skipCloseSyncRef.current = false;
        return;
      }

      syncSearchOnClose(selectedValue);
      return;
    }

    setSearchQuery(selectedOption?.label ?? "");
    requestAnimationFrame(() => {
      inputElementRef.current?.focus();
      inputElementRef.current?.select();
    });
  };

  return (
    <Field
      data-invalid={hasError}
      data-disabled={resolvedDisabled}
      data-size={size}
      className={cn(fullWidth ? "w-full" : "max-w-xs", containerClassName)}
    >
      <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
        <div ref={containerRef} className="relative">
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

            <PopoverPrimitive.Anchor asChild>
              <input
                id={id}
                ref={(node) => {
                  inputElementRef.current = node;
                  if (typeof forwardedInputRef === "function") {
                    forwardedInputRef(node);
                  } else if (forwardedInputRef && "current" in forwardedInputRef) {
                    (forwardedInputRef as React.MutableRefObject<HTMLInputElement | null>).current =
                      node;
                  }

                  if (typeof fieldInputRef === "function") {
                    fieldInputRef(node);
                  } else if (fieldInputRef && "current" in fieldInputRef) {
                    (fieldInputRef as React.MutableRefObject<HTMLInputElement | null>).current =
                      node;
                  }
                }}
                name={resolvedName}
                type="text"
                disabled={resolvedDisabled}
                value={displayedText}
                placeholder={isOpen ? searchPlaceholder : " "}
                onFocus={(event) => {
                  if (suppressNextFocusRef.current) {
                    suppressNextFocusRef.current = false;
                    event.currentTarget.blur();
                    return;
                  }

                  setIsFocused(true);
                  if (!resolvedDisabled) {
                    handleOpenChange(true);
                  }
                }}
                onBlur={(event) => {
                  setIsFocused(false);
                  field?.onBlur?.();
                  onBlur?.(event);
                }}
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  setSearchQuery(nextQuery);
                  onSearchChange?.(nextQuery);

                  if (selectedOption && nextQuery !== selectedOption.label) {
                    commitValue(undefined);
                  }
                }}
                className={cn(
                  "w-full border-0 bg-transparent shadow-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none",
                  "placeholder:text-transparent focus:placeholder:text-muted-foreground/50",
                  sizeClasses[size].input,
                  "relative z-10",
                  hasVisibleClearButton && "pr-12",
                  hasSelectedAccessory && (hasVisibleClearButton ? "pr-24" : "pr-12"),
                  hasSelectedCustomContent &&
                    "text-transparent caret-transparent selection:bg-transparent",
                )}
                aria-invalid={hasError}
                aria-describedby={
                  (helperText && !hasError) || hasError ? `${id}-description` : undefined
                }
              />
            </PopoverPrimitive.Anchor>
            {hasSelectedCustomContent && selectedOption ? (
              <div
                className={cn(
                  "pointer-events-none absolute flex items-end overflow-hidden",
                  sizeClasses[size].selectedOverlay,
                )}
              >
                {renderSelected?.(selectedOption)}
              </div>
            ) : null}
            {hasSelectedAccessory && selectedOption ? (
              <div
                className={cn(
                  "pointer-events-none absolute top-1/2 -translate-y-1/2 z-10",
                  hasVisibleClearButton
                    ? sizeClasses[size].accessoryWithClear
                    : sizeClasses[size].accessoryWithoutClear,
                )}
              >
                {renderSelectedAccessory?.(selectedOption)}
              </div>
            ) : null}

            <ChevronDown
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 size-5 text-muted-foreground opacity-100 transition-transform duration-200",
                sizeClasses[size].chevron,
                isOpen && "rotate-180",
              )}
            />

            {hasVisibleClearButton && (
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  suppressNextFocusRef.current = true;
                  inputElementRef.current?.blur();
                  handleClear();
                  skipCloseSyncRef.current = true;
                  handleOpenChange(false);
                  requestAnimationFrame(() => {
                    suppressNextFocusRef.current = false;
                  });
                }}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 p-1 rounded-full z-[100]",
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
              onOpenAutoFocus={(event) => event.preventDefault()}
              onPointerDownOutside={(event) => {
                // Prevent closing when clicking inside the input (which is technically outside the content)
                if (inputElementRef.current?.contains(event.target as Node)) {
                  event.preventDefault();
                }
              }}
              onInteractOutside={(event) => {
                // Ensure interaction with the input doesn't close the popover unexpectedly
                if (inputElementRef.current?.contains(event.target as Node)) {
                  event.preventDefault();
                }
              }}
              style={{ ...dropdownStyle, width: contentWidth }}
            >
              <div className="max-h-[260px] overflow-y-auto p-1.5">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        handleSelect(option.value);
                      }}
                      disabled={option.disabled}
                      className={cn(
                        "relative flex w-full items-center rounded-lg py-2.5 px-3 text-left text-sm transition-[color,background-color,border-color] duration-150",
                        "text-foreground/90 border border-transparent",
                        "hover:text-foreground hover:[background:var(--glass-select-item-hover)]",
                        selectedValue === option.value &&
                          "[background:var(--glass-select-item-active)] [border-color:var(--glass-select-item-active-border)]",
                        option.disabled && "pointer-events-none opacity-50",
                      )}
                    >
                      {renderOption ? (
                        <span className="flex w-full items-center">
                          {renderOption(option, selectedValue === option.value)}
                        </span>
                      ) : (
                        <>
                          <span className="flex-1">{option.label}</span>
                          {selectedValue === option.value ? (
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

const SelectWithSearchInFieldV2 = FluriFieldV2Combobox;

export { FluriFieldV2Combobox, SelectWithSearchInFieldV2 };
export default FluriFieldV2Combobox;
