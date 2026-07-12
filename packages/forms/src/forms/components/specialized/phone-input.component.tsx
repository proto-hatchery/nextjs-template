"use client";

import { countries } from "countries-list";
import { Check as CheckIcon, Phone as PhoneIcon } from "lucide-react";
import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { CircleFlag } from "react-circle-flags";
import * as RPNInput from "react-phone-number-input";

import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import { useMediaQuery } from "@workspace/forms/hooks/use-media-query";
import {
  buildPhoneChangeDetails,
  deriveCountryFromNumber,
  formatBrazilianPhone,
  formatUSPhone,
  formatPortugalPhone,
  formatPhoneDisplay,
  type PhoneDisplayFormat,
} from "@workspace/forms/utils/phone";

import type { PhoneFieldProps } from "@workspace/forms/types";

const getCountryName = (countryCode: string): string => {
  try {
    const regionNames = new Intl.DisplayNames(["pt-BR"], { type: "region" });
    return regionNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
};

const getContinentName = (continentCode: string): string => {
  const translations: Record<string, string> = {
    AF: "África",
    AS: "Ásia",
    EU: "Europa",
    NA: "América do Norte",
    SA: "América do Sul",
    OC: "Oceania",
    AN: "Antártida",
    OTHER: "Outros",
  };
  return translations[continentCode] || continentCode;
};

const safeGetCallingCode = (country?: RPNInput.Country): string | undefined => {
  if (!country) return undefined;
  try {
    return RPNInput.getCountryCallingCode(country);
  } catch {
    return undefined;
  }
};

const sizeClasses = {
  sm: {
    input: "h-8 text-sm px-3",
    trigger: "h-8 px-2.5",
    iconSlot: "px-2.5",
    iconSize: 14,
    prefix: "h-8 px-2.5 text-sm",
  },
  md: {
    input: "h-10 text-base px-3",
    trigger: "h-10 px-3",
    iconSlot: "px-3",
    iconSize: 16,
    prefix: "h-10 px-3 text-base",
  },
  lg: {
    input: "h-11 text-lg px-3.5",
    trigger: "h-11 px-3.5",
    iconSlot: "px-3.5",
    iconSize: 18,
    prefix: "h-11 px-3.5 text-lg",
  },
} as const;

export const PhoneField = ({
  label,
  helperText,
  errorMessage,
  errorText,
  startIcon,
  endIcon,
  size = "md",
  containerClassName,
  labelClassName,
  helperTextClassName,
  hideLabel = false,
  value,
  defaultValue,
  onChange,
  onValueChange,
  onValueBlur,
  defaultCountry = "BR",
  country: countryProp,
  onCountryChange,
  withCountrySelect = true,
  international = true,
  countries: allowedCountries,
  required = false,
  className,
  placeholder,
  disabled,
  formatOnBlur = true,
  displayFormat = "national",
  normalizeOnChange = true,
  autoComplete: autoCompleteProp,
  onBlur: onBlurProp,
  onFocus: onFocusProp,
  id: idProp,
  type: _type,
  inputMode: _inputMode,
  ...inputProps
}: PhoneFieldProps) => {
  void _type;
  void _inputMode;

  const componentId = useId();
  const inputId = idProp ?? componentId;
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDisplayFormat: PhoneDisplayFormat =
    displayFormat ?? (international ? "international" : "national");
  const availableCountries = useMemo<RPNInput.Country[]>(() => {
    const base =
      allowedCountries && allowedCountries.length ? allowedCountries : RPNInput.getCountries();
    if (base?.length) {
      return base;
    }
    if (defaultCountry) {
      return [defaultCountry];
    }
    return ["BR"];
  }, [allowedCountries, defaultCountry]);

  const derivedCountryFromValue = useMemo(
    () =>
      deriveCountryFromNumber(
        value ?? (typeof defaultValue === "string" ? defaultValue : undefined),
        defaultCountry,
      ),
    [defaultCountry, defaultValue, value],
  );

  const [internalCountry, setInternalCountry] = useState<RPNInput.Country | undefined>(
    countryProp ?? derivedCountryFromValue ?? defaultCountry,
  );
  const [hasUserSelectedCountry, setHasUserSelectedCountry] = useState(false);

  useEffect(() => {
    if (countryProp) {
      setInternalCountry(countryProp);
    }
  }, [countryProp]);

  useEffect(() => {
    if (countryProp || hasUserSelectedCountry) return;
    const derived = derivedCountryFromValue;
    if (derived && derived !== internalCountry && availableCountries.includes(derived)) {
      setInternalCountry(derived);
    }
  }, [
    availableCountries,
    countryProp,
    derivedCountryFromValue,
    hasUserSelectedCountry,
    internalCountry,
  ]);

  const currentCountry = useMemo(() => {
    const candidate =
      countryProp ?? internalCountry ?? derivedCountryFromValue ?? defaultCountry ?? undefined;
    if (candidate && availableCountries.includes(candidate)) {
      return candidate;
    }
    return availableCountries[0];
  }, [availableCountries, countryProp, defaultCountry, derivedCountryFromValue, internalCountry]);

  const [inputValue, setInputValue] = useState<string>(() =>
    formatPhoneDisplay(
      typeof value === "string"
        ? value
        : typeof defaultValue === "string"
          ? defaultValue
          : undefined,
      {
        ...(currentCountry !== undefined ? { country: currentCountry } : {}),
        format: initialDisplayFormat,
      },
    ),
  );

  const lastNormalizedValueRef = useRef<string | undefined>(
    typeof value === "string" ? value : undefined,
  );

  useEffect(() => {
    const normalizedExternal = typeof value === "string" ? value : "";
    if (normalizedExternal === (lastNormalizedValueRef.current ?? "")) {
      return;
    }

    const formatted = formatPhoneDisplay(normalizedExternal, {
      ...(currentCountry !== undefined ? { country: currentCountry } : {}),
      format: initialDisplayFormat,
    });
    setInputValue(formatted);
    lastNormalizedValueRef.current = normalizedExternal || undefined;
  }, [currentCountry, initialDisplayFormat, value]);

  // Simplified Error Handling: Only use props
  const computedErrorMessage = errorMessage ?? errorText;
  const hasError = Boolean(computedErrorMessage);
  const helperId = helperText && !computedErrorMessage ? `${inputId}-helper` : undefined;
  const errorId = computedErrorMessage ? `${inputId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;
  const autoComplete = autoCompleteProp ?? "tel";
  const resolvedSize: keyof typeof sizeClasses =
    size === "sm" || size === "md" || size === "lg" ? size : "md";

  const paddingClasses = useMemo(
    () =>
      cn({
        "ps-9": !!startIcon && resolvedSize === "sm",
        "ps-10": !!startIcon && resolvedSize === "md",
        "ps-12": !!startIcon && resolvedSize === "lg",
        "pe-9": !!endIcon && resolvedSize === "sm",
        "pe-10": !!endIcon && resolvedSize === "md",
        "pe-12": !!endIcon && resolvedSize === "lg",
      }),
    [endIcon, resolvedSize, startIcon],
  );

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    // Show country-specific placeholder
    if (currentCountry === "BR") {
      return "(11) 91234-5678";
    }
    if (currentCountry === "US" || currentCountry === "CA") {
      return "(555) 123-4567";
    }
    if (currentCountry === "PT") {
      return "912 345 678";
    }
    // Generic placeholder
    return "Número de telefone";
  };

  const handleCountrySelect = useCallback(
    (nextCountry: RPNInput.Country) => {
      setHasUserSelectedCountry(true);
      setInternalCountry(nextCountry);
      onCountryChange?.(nextCountry);
      setTimeout(() => {
        const input = containerRef.current?.querySelector(
          'input[data-slot="phone-input"]',
        ) as HTMLInputElement | null;
        input?.focus();
      }, 80);
    },
    [onCountryChange],
  );

  const emitChange = useCallback(
    (raw: string, countryOverride?: RPNInput.Country) => {
      const country = countryOverride ?? currentCountry;
      const details = buildPhoneChangeDetails(raw, country, initialDisplayFormat);
      const fallbackNormalized =
        details.cleaned.length > 0
          ? details.cleaned.startsWith("+")
            ? details.cleaned
            : details.country
              ? `+${details.cleaned}`
              : details.cleaned
          : undefined;
      const nextValue = normalizeOnChange ? (details.e164 ?? fallbackNormalized) : raw || undefined;

      lastNormalizedValueRef.current = nextValue;
      onChange?.(nextValue, details);
      onValueChange?.(details);
    },
    [currentCountry, initialDisplayFormat, normalizeOnChange, onChange, onValueChange],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;

      // Detect international mode when user types +
      const startsWithPlus = rawValue.startsWith("+");

      // If typing international number, try to detect country from number
      if (startsWithPlus && rawValue.length > 1) {
        const detectedCountry = deriveCountryFromNumber(rawValue, defaultCountry);
        if (detectedCountry && detectedCountry !== internalCountry) {
          setInternalCountry(detectedCountry);
          onCountryChange?.(detectedCountry);
        }
        setInputValue(rawValue);
        emitChange(rawValue, detectedCountry);
      } else if (!startsWithPlus && currentCountry === "BR") {
        // Brazilian mode: apply live formatting for BR numbers

        // Smart Delete Handling:
        // If the user deleted a character but the digit count is the same,
        // it means they deleted a separator (e.g. backspace on ")").
        // We should remove the digit preceding the cursor to unblock them.
        const oldDigits = inputValue.replace(/\D/g, "");
        const newDigits = rawValue.replace(/\D/g, "");

        let valueToFormat = rawValue;

        if (rawValue.length < inputValue.length && oldDigits === newDigits) {
          // Deletion detected, but digits are same -> Separator deleted.
          // Remove the last digit for simplicity (or we could try to be smarter about cursor pos)
          // For standard "end of line" typing, removing last digit works well.
          valueToFormat = newDigits.slice(0, -1);
        }

        const formatted = formatBrazilianPhone(valueToFormat);
        setInputValue(formatted);
        emitChange(formatted);
        setInputValue(formatted);
        emitChange(formatted);
      } else if (!startsWithPlus && (currentCountry === "US" || currentCountry === "CA")) {
        // US/Canada mode: apply live formatting
        const oldDigits = inputValue.replace(/\D/g, "");
        const newDigits = rawValue.replace(/\D/g, "");

        let valueToFormat = rawValue;

        if (rawValue.length < inputValue.length && oldDigits === newDigits) {
          valueToFormat = newDigits.slice(0, -1);
        }

        const formatted = formatUSPhone(valueToFormat);
        setInputValue(formatted);
        emitChange(formatted);
      } else if (!startsWithPlus && currentCountry === "PT") {
        // Portugal mode: apply live formatting
        const oldDigits = inputValue.replace(/\D/g, "");
        const newDigits = rawValue.replace(/\D/g, "");

        let valueToFormat = rawValue;

        if (rawValue.length < inputValue.length && oldDigits === newDigits) {
          valueToFormat = newDigits.slice(0, -1);
        }

        const formatted = formatPortugalPhone(valueToFormat);
        setInputValue(formatted);
        emitChange(formatted);
      } else {
        // Other countries: just pass through
        setInputValue(rawValue);
        emitChange(rawValue);
      }
    },
    [currentCountry, defaultCountry, emitChange, inputValue, internalCountry, onCountryChange],
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      let nextDisplayValue = inputValue;
      if (formatOnBlur && initialDisplayFormat !== "raw") {
        let formatted = inputValue;

        if (currentCountry === "BR") {
          // Use the specific BR formatter to preserve partial masks (e.g. "(11) ")
          formatted = formatBrazilianPhone(inputValue);
        } else if (currentCountry === "US" || currentCountry === "CA") {
          formatted = formatUSPhone(inputValue);
        } else if (currentCountry === "PT") {
          formatted = formatPortugalPhone(inputValue);
        } else {
          formatted = formatPhoneDisplay(inputValue, {
            ...(currentCountry !== undefined ? { country: currentCountry } : {}),
            format: initialDisplayFormat,
          });
        }

        if (formatted !== inputValue) {
          nextDisplayValue = formatted;
          setInputValue(formatted);
        }
      }

      onValueBlur?.(
        buildPhoneChangeDetails(nextDisplayValue, currentCountry, initialDisplayFormat),
      );
      onBlurProp?.(event);
    },
    [currentCountry, formatOnBlur, initialDisplayFormat, inputValue, onBlurProp, onValueBlur],
  );

  const countryOptions = useMemo(() => {
    return (availableCountries ?? []).map((countryCode) => {
      const countryLabel = getCountryName(countryCode);
      const callingCode = safeGetCallingCode(countryCode);
      const countryData = countries[countryCode as keyof typeof countries];
      return {
        value: countryCode,
        label: countryLabel,
        ...(callingCode !== undefined ? { callingCode } : {}),
        continent: countryData?.continent,
        searchText: [countryLabel, callingCode ? `+${callingCode}` : ""].filter(Boolean).join(" "),
      };
    });
  }, [availableCountries]);

  return (
    <Field
      ref={containerRef}
      data-invalid={hasError}
      data-disabled={disabled}
      data-size={resolvedSize}
      className={cn(containerClassName)}
      dir="ltr"
    >
      {label && !hideLabel && (
        <FieldLabel
          htmlFor={inputId}
          className={cn(
            {
              "text-xs": size === "sm",
              "text-sm": size === "md",
              "text-base": size === "lg",
            },
            labelClassName,
          )}
          aria-required={required}
        >
          {label}
        </FieldLabel>
      )}

      <div className="group flex w-full gap-0 rounded-md focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:z-10 relative">
        {withCountrySelect && (
          <CountrySelect
            {...(currentCountry !== undefined ? { value: currentCountry } : {})}
            options={countryOptions}
            onChange={handleCountrySelect}
            {...(disabled !== undefined ? { disabled } : {})}
            size={resolvedSize}
            {...(describedBy !== undefined ? { describedBy } : {})}
          />
        )}

        <div className="relative flex flex-1">
          <PhoneInputField
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={hasError}
            aria-required={required}
            className={cn(
              sizeClasses[resolvedSize].input,
              withCountrySelect && "rounded-l-none -ml-px pl-0",
              paddingClasses,
              "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input",
              className,
            )}
            inputMode="tel"
            autoComplete={autoComplete}
            disabled={disabled}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={onFocusProp}
            placeholder={getPlaceholder()}
            {...inputProps}
          />

          {startIcon && (
            <div
              className={cn(
                "text-muted-foreground/80 absolute inset-y-0 start-0 flex items-center",
                sizeClasses[resolvedSize].iconSlot,
                typeof startIcon === "string" ? "pointer-events-none" : "",
              )}
            >
              <div className="flex h-full items-center justify-center leading-none [&_button]:p-0 [&_button]:leading-none [&_svg]:block">
                {typeof startIcon === "string" ? (
                  <span style={{ fontSize: sizeClasses[resolvedSize].iconSize }}>
                    {startIcon}
                  </span>
                ) : (
                  startIcon
                )}
              </div>
            </div>
          )}

          {endIcon && (
            <div
              className={cn(
                "text-muted-foreground/80 absolute inset-y-0 end-0 flex items-center",
                sizeClasses[resolvedSize].iconSlot,
              )}
            >
              <div className="flex h-full items-center justify-center leading-none [&_button]:p-0 [&_button]:leading-none [&_svg]:block">
                {typeof endIcon === "string" ? (
                  <span style={{ fontSize: sizeClasses[resolvedSize].iconSize }}>{endIcon}</span>
                ) : (
                  endIcon
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {helperText && !computedErrorMessage && (
        <FieldDescription id={helperId} className={helperTextClassName}>
          {helperText}
        </FieldDescription>
      )}

      {computedErrorMessage && (
        <FieldError id={errorId} role="alert">
          {computedErrorMessage}
        </FieldError>
      )}
    </Field>
  );
};

type PhoneInputFieldProps = Omit<React.ComponentProps<"input">, "size" | "type">;

const PhoneInputField = ({ className, ...props }: PhoneInputFieldProps) => {
  return (
    <Input
      type="tel"
      data-slot="phone-input"
      className={cn(
        "cursor-text focus-visible:z-10 bg-input",
        "!border-input !shadow-xs",
        "rounded-md",
        className,
      )}
      {...props}
    />
  );
};

type CountryOption = {
  value: RPNInput.Country;
  label: string;
  callingCode?: string;
  continent?: string;
  searchText: string;
};

type CountrySelectProps = {
  disabled?: boolean;
  value?: RPNInput.Country;
  options: CountryOption[];
  onChange: (value: RPNInput.Country) => void;
  onCountrySelect?: () => void;
  size: keyof typeof sizeClasses;
  describedBy?: string;
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
  size,
  describedBy,
}: CountrySelectProps) => {
  const componentId = useId();
  const [open, setOpen] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const resolvedSize: keyof typeof sizeClasses =
    size === "sm" || size === "md" || size === "lg" ? size : "md";

  const organizedCountries = useMemo(() => {
    type ExtendedCountryOption = CountryOption & { continentLabel?: string };
    const countryOptions = options.filter(Boolean) as ExtendedCountryOption[];
    const result: { [key: string]: { name: string; countries: ExtendedCountryOption[] } } = {};

    const countryMap = new Map(countryOptions.map((option) => [option.value, option]));
    const recommendedCodes = ["BR", "US", "PT"];
    const recommendedCountries: ExtendedCountryOption[] = [];

    recommendedCodes.forEach((code) => {
      const option = countryMap.get(code as RPNInput.Country);
      if (option) {
        recommendedCountries.push({
          ...option,
          continentLabel: getContinentName(option.continent ?? "OTHER"),
        });
      }
    });

    if (recommendedCountries.length > 0) {
      result.recommended = {
        name: "Recomendados",
        countries: recommendedCountries,
      };
    }

    const continentGroups: { [key: string]: ExtendedCountryOption[] } = {};

    countryOptions.forEach((option) => {
      if (!option.value || option.value === "BR") return;
      const continentCode = option.continent ?? "OTHER";
      const translatedName = getCountryName(option.value);
      const callingCode = option.callingCode;

      const extendedOption: ExtendedCountryOption = {
        ...option,
        label: translatedName,
        searchText: `${translatedName}${callingCode ? ` +${callingCode}` : ""}`,
      };

      if (!continentGroups[continentCode]) {
        continentGroups[continentCode] = [];
      }
      (continentGroups[continentCode] as typeof continentGroups[string]).push(extendedOption);
    });

    const continentOrder = ["SA", "NA", "EU", "AS", "AF", "OC", "OTHER"];

    continentOrder.forEach((continentCode) => {
      const continentCountries = continentGroups[continentCode];
      if (continentCountries && continentCountries.length > 0) {
        result[continentCode] = {
          name: getContinentName(continentCode),
          countries: continentCountries.toSorted((a, b) => a.label.localeCompare(b.label)),
        };
      }
    });

    Object.keys(continentGroups).forEach((continentCode) => {
      const continentCountries = continentGroups[continentCode];
      if (
        !continentOrder.includes(continentCode) &&
        continentCountries &&
        continentCountries.length > 0
      ) {
        result[continentCode] = {
          name: getContinentName(continentCode),
          countries: continentCountries.toSorted((a, b) => a.label.localeCompare(b.label)),
        };
      }
    });

    return result;
  }, [options]);

  const handleSelect = useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
      setOpen(false);
    },
    [onChange],
  );


  // Trigger button - compact design with just flag + code
  const TriggerButton = (
    <Button
      variant="ghost"
      role="combobox"
      aria-controls={`${componentId}-listbox`}
      aria-expanded={open}
      tabIndex={-1}
      aria-label="Selecionar país"
      aria-describedby={describedBy}
      disabled={disabled}
      className={cn(
        "text-muted-foreground relative z-10 justify-start rounded-r-none border border-input bg-input font-normal outline-offset-0 outline-none transition-[color,box-shadow] hover:bg-input focus-visible:z-10 focus-visible:border-ring focus-visible:ring-0 focus-visible:ring-offset-0 gap-1 pr-0",
        sizeClasses[resolvedSize].trigger,
      )}
    >
      <FlagComponent
        {...(value !== undefined ? { country: value } : {})}
        countryName={value ?? ""}
        aria-hidden="true"
      />
      <span
        className={cn("text-foreground font-normal", {
          "text-sm": resolvedSize === "sm",
          "text-base md:text-sm": resolvedSize === "md",
          "text-lg": resolvedSize === "lg",
        })}
      >
        {value && safeGetCallingCode(value) ? `+${safeGetCallingCode(value)}` : ""}
      </span>
    </Button>
  );

  const CountryListContent = (
    <Command>
      <div className="sticky top-0 z-10 bg-background px-4 py-2">
        <CommandInput placeholder="Pesquisar país ou código..." className="h-10" />
      </div>
      <CommandList className={cn("max-h-[300px]", isMobile && "max-h-[calc(85vh-100px)]")}>
        <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
        {Object.entries(organizedCountries).map(([continentKey, continent]) => (
          <Fragment key={continentKey}>
            <CommandGroup heading={continent.name}>
              {continent.countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={country.searchText}
                  onSelect={() => handleSelect(country.value as RPNInput.Country)}
                  className="py-3"
                >
                  <div className="flex items-center gap-3 w-full">
                    <FlagComponent
                      {...(country.value !== undefined
                        ? { country: country.value as RPNInput.Country }
                        : {})}
                      countryName={country.label}
                      aria-hidden="true"
                    />
                    <span className="flex flex-col flex-1">
                      <span className="text-sm font-medium">{country.label}</span>
                      {country.callingCode && (
                        <span className="text-muted-foreground text-xs">{`+${country.callingCode}`}</span>
                      )}
                    </span>
                    {value === country.value && (
                      <CheckIcon size={16} className="ml-auto text-primary" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Fragment>
        ))}
      </CommandList>
    </Command>
  );

  // Mobile: Sheet from bottom (easier thumb access)
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{TriggerButton}</SheetTrigger>
        <SheetContent
          id={`${componentId}-listbox`}
          side="bottom"
          className="h-[85vh] px-0 rounded-t-xl overflow-hidden flex flex-col"
        >
          <div className="mx-auto mt-2 h-1.5 w-[50px] rounded-full bg-muted/50" />
          <SheetHeader className="px-4 pb-2 pt-4 text-left">
            <SheetTitle>Selecionar país</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">{CountryListContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Popover dropdown
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
      <PopoverContent className="border-input w-full min-w-[280px] p-0" align="start">
        {CountryListContent}
      </PopoverContent>
    </Popover>
  );
};

type FlagProps = { country?: RPNInput.Country; countryName: string };

const FlagComponent = ({ country, countryName }: FlagProps) => {
  if (!country) {
    return (
      <span className="flex h-5 w-5 items-center justify-center">
        <PhoneIcon size={16} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className="h-5 w-5 overflow-hidden rounded-full">
      <CircleFlag
        countryCode={country.toLowerCase()}
        height="20"
        title={countryName}
        style={{ display: "block" }}
      />
    </span>
  );
};

PhoneField.displayName = "PhoneField";

export const PhoneInput = PhoneField;
