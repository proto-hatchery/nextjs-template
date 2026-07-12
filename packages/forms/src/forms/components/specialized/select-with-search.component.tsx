"use client";

import {
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  Loader2 as LoaderIcon,
  X as XMarkIcon,
} from "lucide-react";
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";

import type { SelectOption, SelectWithSearchProps } from "@workspace/forms/types";

const defaultFilterFunction = (option: SelectOption, searchValue: string): boolean => {
  const search = searchValue.toLowerCase();
  return (
    option.label.toLowerCase().includes(search) ||
    option.value.toLowerCase().includes(search) ||
    (option.description ? option.description.toLowerCase().includes(search) : false)
  );
};

const useDebouncedValue = <T,>(value: T, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
};

const SelectWithSearch = ({
  label,
  helperText,
  errorMessage,
  size = "md",
  variant = "default",
  containerClassName,
  labelClassName,
  helperTextClassName,
  hideLabel = false,
  required = false,
  disabled = false,
  placeholder = "Selecione uma opção",
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhum resultado encontrado",
  loadingMessage = "Buscando resultados...",
  value,
  onChange,
  options = [],
  groups = [],
  allowClear = true,
  filterFunction = defaultFilterFunction,
  isInvalid = false,
  autoFocus = false,
  minSearchLength = 0,
  searchDelay = 300,
  onSearch,
  searchOnFocus = false,
  open: controlledOpen,
  onOpenChange,
  ref,
}: SelectWithSearchProps) => {
  const id = useId();
  const commandInputId = `${id}-cmdk-input`;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const hasError = !!errorMessage || isInvalid;
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedValue(searchValue, searchDelay);
  const shouldEnforceMinSearch = minSearchLength > 0;
  const meetsMinSearch = searchValue.length >= minSearchLength;
  const isAsync = typeof onSearch === "function";
  const showSearchPrompt = shouldEnforceMinSearch && !meetsMinSearch && !(searchOnFocus && isAsync);
  const [asyncOptions, setAsyncOptions] = useState<SelectOption[]>([]);
  const asyncOptionsRef = useRef(asyncOptions);
  useEffect(() => {
    asyncOptionsRef.current = asyncOptions;
  }, [asyncOptions]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAsyncOption, setSelectedAsyncOption] = useState<SelectOption | undefined>(
    undefined,
  );

  const useGroups = groups.length > 0;
  const staticOptions = useMemo(
    () => (useGroups ? groups.flatMap((group) => group.options) : options),
    [groups, options, useGroups],
  );

  useEffect(() => {
    if (value === undefined || value === null || value === "") {
      setSelectedAsyncOption(undefined);
      return;
    }
    if (selectedAsyncOption && selectedAsyncOption.value === value) {
      return;
    }
    const asyncMatch = asyncOptions.find((opt) => opt.value === value);
    if (asyncMatch) {
      setSelectedAsyncOption(asyncMatch);
    }
  }, [value, asyncOptions, selectedAsyncOption]);

  const selectedOption = useMemo(() => {
    if (value === undefined || value === null || value === "") return undefined;
    const staticMatch = staticOptions.find((option) => option.value === value);
    if (staticMatch) return staticMatch;
    const asyncMatch = asyncOptions.find((opt) => opt.value === value);
    if (asyncMatch) return asyncMatch;
    // If not found, use the saved selected option
    if (selectedAsyncOption && selectedAsyncOption.value === value) {
      return selectedAsyncOption;
    }
    return undefined;
  }, [asyncOptions, staticOptions, value, selectedAsyncOption]);

  const buttonClasses = cn(
    "w-full justify-between border border-input bg-background px-3 font-normal outline-offset-0 outline-none transition-[color,box-shadow]",
    "hover:bg-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    {
      "h-8 text-sm px-2": size === "sm",
      "h-10 text-sm": size === "md",
      "h-11 text-base": size === "lg",
      "bg-background border-input": variant === "default",
      "bg-transparent border-transparent": variant === "ghost",
      "border-destructive focus-visible:ring-destructive/20": hasError,
      "cursor-not-allowed opacity-60": disabled,
    },
  );

  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const describedBy = errorMessage ? errorId : helperId;

  const closePopover = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
    setSearchValue("");
    if (!value) {
      setAsyncOptions([]);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled) return;
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      setSearchValue("");
      if (!value) {
        setAsyncOptions([]);
      }
    }
  };

  const handleSelect = (selectedValue: string) => {
    const nextValue = selectedValue === value ? undefined : selectedValue;

    if (nextValue) {
      const selectedOpt =
        asyncOptions.find((opt) => opt.value === nextValue) ||
        staticOptions.find((opt) => opt.value === nextValue);
      if (selectedOpt) {
        if (isAsync) {
          setSelectedAsyncOption(selectedOpt);
        }
        // Update the value immediately (optimistic) - the option is already saved
        onChange?.(nextValue);
      } else {
        onChange?.(nextValue);
      }
    } else {
      setSelectedAsyncOption(undefined);
      onChange?.(undefined);
    }

    closePopover();
  };

  const handleClear = (event: React.MouseEvent | React.KeyboardEvent | React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedAsyncOption(undefined);
    onChange?.(undefined);
  };

  useEffect(() => {
    if (!open || !autoFocus) return;
    const frame = requestAnimationFrame(() => {
      const input = document.getElementById(commandInputId) as HTMLInputElement | null;
      input?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [autoFocus, commandInputId, open]);

  useEffect(() => {
    if (!isAsync) return;
    const canSearch = open && (meetsMinSearch || (searchOnFocus && isAsync));
    if (!canSearch) {
      setIsLoading(false);
      if (!searchOnFocus && !meetsMinSearch) {
        // If there's a selected value, keep the option in asyncOptions
        if (!value) {
          setAsyncOptions([]);
        }
      }
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const executeSearch = async () => {
      try {
        const result = await onSearch?.(debouncedSearch);
        if (!cancelled) {
          if (value && result) {
            const selectedInResults = result.find((opt) => opt.value === value);
            if (!selectedInResults) {
              const selectedOpt =
                selectedAsyncOption || asyncOptionsRef.current.find((opt) => opt.value === value);
              if (selectedOpt) {
                setAsyncOptions([selectedOpt, ...result]);
                return;
              }
            }
          }
          setAsyncOptions(result ?? []);
        }
      } catch {
        if (!cancelled) {
          if (!value) {
            setAsyncOptions([]);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void executeSearch();
    return () => {
      cancelled = true;
    };
  }, [
    debouncedSearch,
    isAsync,
    meetsMinSearch,
    onSearch,
    open,
    searchOnFocus,
    value,
    selectedAsyncOption,
    asyncOptionsRef,
  ]);

  const filteredGroups = useMemo(() => {
    if (!useGroups) return [];
    const canFilter = !shouldEnforceMinSearch || meetsMinSearch;
    return groups
      .map((group) => ({
        label: group.label,
        options: canFilter
          ? group.options.filter((option) => filterFunction(option, searchValue))
          : group.options,
      }))
      .filter((group) => group.options.length > 0);
  }, [filterFunction, groups, meetsMinSearch, searchValue, shouldEnforceMinSearch, useGroups]);

  const filteredOptions = useMemo(() => {
    if (useGroups) return [];
    const canFilter = !shouldEnforceMinSearch || meetsMinSearch;
    return canFilter ? options.filter((option) => filterFunction(option, searchValue)) : options;
  }, [filterFunction, meetsMinSearch, options, searchValue, shouldEnforceMinSearch, useGroups]);

  const hasStaticResults = useGroups
    ? filteredGroups.some((group) => group.options.length > 0)
    : filteredOptions.length > 0;

  const shouldShowStaticEmpty = !isAsync && !showSearchPrompt && !hasStaticResults;
  const shouldShowAsyncEmpty =
    isAsync && !isLoading && !showSearchPrompt && asyncOptions.length === 0;

  const minSearchMessage =
    minSearchLength === 1
      ? "Digite pelo menos 1 caractere para buscar."
      : `Digite pelo menos ${minSearchLength} caracteres para buscar.`;

  const renderOption = (option: SelectOption) => (
    <CommandItem
      key={option.value}
      value={`${option.value} ${option.label} ${option.description ?? ""}`}
      onSelect={() => handleSelect(option.value)}
      disabled={!!option.disabled}
      className={cn(
        "flex items-center justify-between",
        option.disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div className="flex min-w-0 flex-col">
        <span className="truncate">{option.label}</span>
        {option.description ? (
          <span className="text-muted-foreground text-xs">{option.description}</span>
        ) : null}
      </div>
      {value === option.value ? <CheckIcon className="size-4 shrink-0" aria-hidden="true" /> : null}
    </CommandItem>
  );

  return (
    <Field
      data-invalid={hasError}
      data-disabled={disabled}
      data-size={size}
      className={cn(containerClassName)}
    >
      {label && !hideLabel ? (
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
          {required ? (
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          ) : null}
        </FieldLabel>
      ) : null}

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            id={id}
            type="button"
            variant="secondary"
            role="combobox"
            aria-controls={`${id}-listbox`}
            aria-expanded={open}
            aria-invalid={hasError}
            aria-required={required}
            aria-describedby={describedBy}
            disabled={disabled}
            className={buttonClasses}
          >
            <span className={cn("truncate text-left", !selectedOption && "text-muted-foreground")}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              {selectedOption && allowClear && !disabled ? (
                <button
                  type="button"
                  className="text-muted-foreground/80 hover:text-foreground inline-flex size-4 items-center justify-center rounded-sm transition-colors cursor-pointer bg-transparent border-none p-0"
                  aria-label="Limpar seleção"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClear(e);
                  }}
                >
                  <XMarkIcon className="size-3" />
                </button>
              ) : null}
              <ChevronDownIcon
                className="text-muted-foreground/80 size-4 shrink-0"
                aria-hidden="true"
              />
            </div>
          </Button>
        </PopoverTrigger>
        {open ? (
          <PopoverContent
            id={`${id}-listbox`}
            align="start"
            sideOffset={8}
            className="border border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          >
            <Command shouldFilter={false}>
              <CommandInput
                id={commandInputId}
                value={searchValue}
                onValueChange={setSearchValue}
                placeholder={searchPlaceholder}

              />
              <CommandList className="max-h-64 overflow-y-auto">
                {showSearchPrompt ? (
                  <div className="text-muted-foreground px-3 py-6 text-center text-sm">
                    {minSearchMessage}
                  </div>
                ) : null}

                {!showSearchPrompt && isAsync ? (
                  <>
                    {isLoading ? (
                      <div className="text-muted-foreground flex items-center justify-center gap-2 px-3 py-6 text-sm">
                        <LoaderIcon className="size-4 animate-spin" aria-hidden="true" />
                        {loadingMessage}
                      </div>
                    ) : null}
                    {!isLoading && asyncOptions.length > 0 ? (
                      <CommandGroup>{asyncOptions.map(renderOption)}</CommandGroup>
                    ) : null}
                  </>
                ) : null}

                {!showSearchPrompt && !isAsync ? (
                  useGroups ? (
                    filteredGroups.map((group) => (
                      <Fragment key={group.label}>
                        <CommandGroup heading={group.label}>
                          {group.options.map(renderOption)}
                        </CommandGroup>
                      </Fragment>
                    ))
                  ) : (
                    <CommandGroup>{filteredOptions.map(renderOption)}</CommandGroup>
                  )
                ) : null}

                {!showSearchPrompt && (shouldShowStaticEmpty || shouldShowAsyncEmpty) ? (
                  <div className="text-muted-foreground px-3 py-6 text-center text-sm">
                    {emptyMessage}
                  </div>
                ) : null}
              </CommandList>
            </Command>
          </PopoverContent>
        ) : null}
      </Popover>

      {helperText && !errorMessage ? (
        <FieldDescription className={helperTextClassName}>{helperText}</FieldDescription>
      ) : null}

      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </Field>
  );
};

export { SelectWithSearch };
export default SelectWithSearch;
