"use client";

import { Button } from "@workspace/ui/components/button";
import { Check, Eye, EyeOff, Link as LinkIcon } from "lucide-react";
import { OTPInput, type SlotProps } from "input-otp";
import type { CountryCode } from "libphonenumber-js";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CircleFlag } from "react-circle-flags";

import { Spinner } from "@workspace/ui/components/spinner";
import { useViaCep } from "@workspace/forms/hooks/use-viacep";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import type { AddressData } from "@workspace/forms/types/address.types";
import { formatDate, parseDate } from "@workspace/forms/fields/utils/date-formatting";
import { CRP_MASK_PLACEHOLDER } from "@workspace/forms/utils/crp";
import type { V2InputFieldBinding } from "@workspace/forms/v2/rhf";
import {
  formatCnpj,
  formatCpf,
  formatCrp,
  formatCurrencyInput,
  parseBirthdate,
  formatZipCode,
} from "@workspace/forms/utils/formatting";
import {
  calculateStrengthScore,
  checkPasswordStrength,
  getStrengthColor,
  getStrengthText,
  isValidCnpj,
  isValidCpf,
} from "@workspace/forms/utils/validation";
import {
  formatBrazilianPhone,
  formatPortugalPhone,
  formatUSPhone,
  parsePhoneValue,
} from "@workspace/forms/utils/phone";
import {
  shouldPreventDateBeforeInput,
  shouldPreventDateKeyDown,
} from "@workspace/forms/components/base/v2/date-input-guards";
import { FluriFieldV2Input, type FluriFieldV2InputProps } from "@workspace/forms/components/base/v2/fluri-field-v2-input.component";
import { FluriFieldV2SelectWithSearch } from "@workspace/forms/components/base/v2/fluri-field-v2-select-with-search.component";
import type { FluriFieldV2SelectOption } from "@workspace/forms/components/base/v2/fluri-field-v2-select.component";
export { FluriFieldV2FileUpload } from "./fluri-field-v2-file-upload.component";

export type FluriFieldV2CommonProps = Omit<FluriFieldV2InputProps, "type" | "label"> & {
  label?: string;
};

export const FluriFieldV2Cpf = ({
  label = "CPF",
  placeholder = "000.000.000-00",
  value,
  onChange,
  validateOnBlur,
  errorMessage,
  ...props
}: FluriFieldV2CommonProps & { validateOnBlur?: boolean }) => {
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  return (
    <FluriFieldV2Input
      label={label}
      value={value}
      errorMessage={errorMessage ?? localError}
      inputMode="numeric"
      maxLength={14}
      placeholder={placeholder}
      onChange={(event) => {
        event.target.value = formatCpf(event.target.value);
        onChange?.(event);
      }}
      onBlur={(event) => {
        if (validateOnBlur) {
          const raw = event.currentTarget.value;
          if (raw && !isValidCpf(raw)) {
            setLocalError("CPF inválido");
          } else {
            setLocalError(undefined);
          }
        }
        props.onBlur?.(event);
      }}
      {...props}
    />
  );
};

export const FluriFieldV2Cnpj = ({
  label = "CNPJ",
  placeholder = "00.000.000/0000-00",
  value,
  onChange,
  validateOnBlur,
  errorMessage,
  ...props
}: FluriFieldV2CommonProps & { validateOnBlur?: boolean }) => {
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  return (
    <FluriFieldV2Input
      label={label}
      value={value}
      errorMessage={errorMessage ?? localError}
      inputMode="numeric"
      maxLength={18}
      placeholder={placeholder}
      onChange={(event) => {
        event.target.value = formatCnpj(event.target.value);
        onChange?.(event);
      }}
      onBlur={(event) => {
        if (validateOnBlur) {
          const raw = event.currentTarget.value;
          if (raw && !isValidCnpj(raw)) {
            setLocalError("CNPJ inválido");
          } else {
            setLocalError(undefined);
          }
        }
        props.onBlur?.(event);
      }}
      {...props}
    />
  );
};

export const FluriFieldV2Rg = ({
  label = "RG",
  placeholder = "000000000",
  onChange,
  ...props
}: FluriFieldV2CommonProps) => {
  return (
    <FluriFieldV2Input
      label={label}
      inputMode="numeric"
      maxLength={9}
      placeholder={placeholder}
      onChange={(event) => {
        event.target.value = event.target.value.replace(/\D/g, "").slice(0, 9);
        onChange?.(event);
      }}
      {...props}
    />
  );
};

export const FluriFieldV2Crp = ({
  label = "CRP",
  placeholder = CRP_MASK_PLACEHOLDER,
  onChange,
  ...props
}: FluriFieldV2CommonProps) => {
  return (
    <FluriFieldV2Input
      label={label}
      inputMode="numeric"
      maxLength={11}
      placeholder={placeholder}
      onChange={(event) => {
        event.target.value = formatCrp(event.target.value);
        onChange?.(event);
      }}
      {...props}
    />
  );
};

export const FluriFieldV2Cep = ({
  label = "CEP",
  placeholder = "00000-000",
  value,
  onChange,
  onAddressFound,
  onError,
  errorMessage,
  ...props
}: Omit<FluriFieldV2CommonProps, "onError"> & {
  onAddressFound?: (address: AddressData) => void;
  onError?: (error: string) => void;
}) => {
  const { data, error, loading, fetchAddress } = useViaCep(250);
  const lastProcessedDataRef = useRef<AddressData | null>(null);

  useEffect(() => {
    if (!data) {
      lastProcessedDataRef.current = null;
      return;
    }
    if (data !== lastProcessedDataRef.current) {
      lastProcessedDataRef.current = data;
      onAddressFound?.(data);
    }
  }, [data, onAddressFound]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  const hasValidAddress = Boolean(data && !error && !loading);

  return (
    <div className="relative">
      <FluriFieldV2Input
        label={label}
        value={value}
        errorMessage={errorMessage ?? error ?? undefined}
        inputMode="numeric"
        maxLength={9}
        placeholder={placeholder}
        className={cn(hasValidAddress && "pr-10")}
        onChange={(event) => {
          event.target.value = formatZipCode(event.target.value.replace(/\D/g, "").slice(0, 8));
          onChange?.(event);

          const digits = event.target.value.replace(/\D/g, "");
          if (digits.length === 8) {
            void fetchAddress(event.target.value);
          }
        }}
        {...props}
      />
      <div className="absolute right-4 top-[24px] -translate-y-1/2 flex items-center justify-center pointer-events-none">
        {loading && <Spinner className="size-4 text-muted-foreground/40" />}
        {hasValidAddress && !loading && (
          <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 transition-all animate-in zoom-in-75 duration-200">
            <Check className="size-3.5 text-emerald-600 stroke-[3.5]" />
          </div>
        )}
      </div>
    </div>
  );
};

export const FluriFieldV2Currency = ({
  label = "Valor",
  placeholder = "R$ 0,00",
  value,
  onChange,
  ...props
}: FluriFieldV2CommonProps) => {
  return (
    <FluriFieldV2Input
      label={label}
      value={value}
      inputMode="numeric"
      placeholder={placeholder}
      onChange={(event) => {
        const digitsOnly = event.target.value.replace(/\D/g, "");
        event.target.value = formatCurrencyInput(digitsOnly);
        onChange?.(event);
      }}
      {...props}
    />
  );
};

const phoneCountryOptions: FluriFieldV2SelectOption[] = [
  { value: "BR", label: "Brasil (+55)" },
  { value: "US", label: "Estados Unidos (+1)" },
  { value: "PT", label: "Portugal (+351)" },
];

const phoneSelectedLabelByValue: Record<string, string> = {
  BR: "+55",
  US: "+1",
  PT: "+351",
};

const phoneCountryMeta: Record<string, { code: string; name: string; dialCode: string }> = {
  BR: { code: "br", name: "Brasil", dialCode: "+55" },
  US: { code: "us", name: "Estados Unidos", dialCode: "+1" },
  PT: { code: "pt", name: "Portugal", dialCode: "+351" },
};

const formatPhoneByCountry = (value: string, country: CountryCode) => {
  if (country === "US") return formatUSPhone(value);
  if (country === "PT") return formatPortugalPhone(value);
  return formatBrazilianPhone(value);
};

export const FluriFieldV2Phone = ({
  label = "Telefone",
  placeholder,
  value: controlledValue,
  onChange,
  helperText,
  errorMessage,
  fullWidth,
  ...props
}: FluriFieldV2CommonProps) => {
  const [country, setCountry] = useState<CountryCode>("BR");
  const [derivedError, setDerivedError] = useState<string | undefined>(undefined);
  const [displayValue, setDisplayValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { field, ...restProps } = props as {
    field?: V2InputFieldBinding;
  } & FluriFieldV2CommonProps;
  const value = field ? field.value : controlledValue;

  // Initialize country from value if present (E.164 format)
  useEffect(() => {
    if (value && typeof value === "string") {
      const parsed = parsePhoneValue(value);
      if (parsed.country && parsed.country !== country) {
        setCountry(parsed.country);
      }
      // Display the number without country code (national format)
      const digitsOnly = value.replace(/\D/g, "").replace(/^55|^1|^351/, "");
      setDisplayValue(formatPhoneByCountry(digitsOnly, parsed.country ?? country));
    }
  }, [value, country]);

  const buildE164Value = (localNumber: string, countryCode: CountryCode): string => {
    const digitsOnly = localNumber.replace(/\D/g, "");
    if (!digitsOnly) return "";

    const dialCode = phoneCountryMeta[countryCode]?.dialCode.replace("+", "") ?? "";
    return `+${dialCode}${digitsOnly}`;
  };

  const handleValueChange = (e164Value: string, event?: React.ChangeEvent<HTMLInputElement>) => {
    if (field) {
      field.onValueChange(e164Value);
    }

    if (onChange) {
      const syntheticEvent = event
        ? {
            ...event,
            target: { ...event.target, value: e164Value },
          }
        : (() => {
            const eventTarget = { target: { value: e164Value } };
            return eventTarget as React.ChangeEvent<HTMLInputElement>;
          })();
      onChange(syntheticEvent);
    }
  };

  return (
    <div className={cn(fullWidth ? "w-full" : "max-w-xs", "min-w-[250px]")}>
      <div className="flex items-start gap-1.5">
        <div className="w-24 shrink-0">
          <FluriFieldV2SelectWithSearch
            label="País"
            value={country}
            onValueChange={(next) => {
              const nextCountry = next as CountryCode;
              setCountry(nextCountry);

              // Rebuild E.164 value with new country code
              if (displayValue) {
                const e164Value = buildE164Value(displayValue, nextCountry);
                handleValueChange(e164Value);
              }

              // Autofocus on number field when country changes
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }}
            options={phoneCountryOptions}
            dropdownWidth={320}
            selectedLabelByValue={phoneSelectedLabelByValue}
            searchPlaceholder="Buscar país..."
            renderOption={(option, selected) => {
              const meta = phoneCountryMeta[option.value] ?? {
                code: option.value.toLowerCase(),
                name: option.label,
                dialCode: "",
              };

              return (
                <>
                  <span className="flex min-w-0 items-center gap-2.5">
                    <CircleFlag countryCode={meta.code} className="size-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{meta.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {meta.dialCode}
                      </span>
                    </span>
                  </span>
                  {selected ? (
                    <span
                      className="ml-auto size-1.5 rounded-full"
                      style={{
                        backgroundColor: "var(--primary)",
                        boxShadow: "0 0 0 3px color-mix(in oklab, var(--primary) 22%, transparent)",
                      }}
                    />
                  ) : null}
                </>
              );
            }}
            fullWidth
            showClearButton={false}
          />
        </div>
        <div className="flex-1 min-w-0">
          <FluriFieldV2Input
            label={label}
            inputRef={field?.ref ?? inputRef}
            value={displayValue}
            helperText={helperText}
            errorMessage={errorMessage ?? derivedError}
            inputMode="tel"
            fullWidth
            placeholder={
              placeholder ??
              (country === "US"
                ? "(555) 123-4567"
                : country === "PT"
                  ? "912 345 678"
                  : "(11) 91234-5678")
            }
            onChange={(event) => {
              const rawValue = event.target.value;
              const previousDigits = displayValue.replace(/\D/g, "");
              const nextDigits = rawValue.replace(/\D/g, "");

              let valueToFormat = rawValue;

              // If user backspaces over a mask separator, force-delete the previous real digit.
              if (rawValue.length < displayValue.length && previousDigits === nextDigits) {
                valueToFormat = nextDigits.slice(0, -1);
              }

              let formatted = formatPhoneByCountry(valueToFormat, country);

              // BR UX rule: when dropping below full DDD, do not keep an incomplete mask.
              if (country === "BR" && formatted === "(5") {
                formatted = "5";
              }

              setDisplayValue(formatted);

              // Build E.164 format (+countrycode + digits)
              const e164Value = buildE164Value(formatted, country);
              handleValueChange(e164Value, event);
            }}
            onBlur={(event) => {
              const e164Value = buildE164Value(displayValue, country);
              const parsed = parsePhoneValue(e164Value, country);

              if (displayValue && !parsed.isValid) {
                setDerivedError("Telefone inválido para o país selecionado");
              } else {
                setDerivedError(undefined);
              }

              // Call original onBlur with E.164 value
              if (field) {
                field.onBlur?.();
              }

              if (props.onBlur) {
                const syntheticEvent = {
                  ...event,
                  target: { ...event.target, value: e164Value },
                  currentTarget: { ...event.currentTarget, value: e164Value },
                };
                props.onBlur(syntheticEvent);
              }
            }}
            {...restProps}
          />
        </div>
      </div>
    </div>
  );
};

export const FluriFieldV2Password = ({
  label = "Senha",
  value,
  onChange,
  showRequirements = false,
  fullWidth: _fullWidth,
  ...props
}: FluriFieldV2CommonProps & { showRequirements?: boolean }) => {
  const [visible, setVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState(String(value ?? ""));

  useEffect(() => {
    setPasswordValue(String(value ?? ""));
  }, [value]);

  const requirements = useMemo(() => checkPasswordStrength(passwordValue), [passwordValue]);
  const score = calculateStrengthScore(requirements);

  return (
    <div className="max-w-xs space-y-2">
      <div className="relative">
        <FluriFieldV2Input
          label={label}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => {
            setPasswordValue(event.target.value);
            onChange?.(event);
          }}
          className="pr-12"
          fullWidth={false}
          {...props}
        />
        <Button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar senha" : "Exibir senha"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>

      {showRequirements ? (
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{getStrengthText(score)}</span>
            <span>{score}/5</span>
          </div>
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full ${getStrengthColor(score)}`}
              style={{ width: `${score * 20}%` }}
            />
          </div>
          <ul className="space-y-1 text-xs">
            {requirements.map((item) => (
              <li key={item.id} className={item.met ? "text-foreground" : "text-muted-foreground"}>
                {item.met ? "✓" : "•"} {item.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export const FluriFieldV2Otp = ({
  label = "Código",
  value,
  onChange,
  length = 6,
  helperText,
  errorMessage,
}: {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  length?: number;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
}) => {
  const id = useId();
  const hasError = Boolean(errorMessage);

  return (
    <Field data-invalid={hasError} className="max-w-xs">
      <FieldLabel htmlFor={id} className="text-sm font-medium">
        {label}
      </FieldLabel>

      <OTPInput
        id={id}
        value={value}
        onChange={onChange}
        maxLength={length}
        inputMode="numeric"
        pattern="\d*"
        autoComplete="one-time-code"
        containerClassName="flex items-center gap-2"
        render={({ slots }) => (
          <div className="flex gap-2">
            {slots.map((slot, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <FluriOtpSlot key={index} {...slot} hasError={hasError} />
            ))}
          </div>
        )}
      />

      {hasError && errorMessage ? (
        <FieldError className="text-xs">{errorMessage}</FieldError>
      ) : helperText ? (
        <FieldDescription className="text-xs">{helperText}</FieldDescription>
      ) : null}
    </Field>
  );
};

interface FluriOtpSlotProps extends SlotProps {
  hasError?: boolean;
}

const FluriOtpSlot = ({ hasError = false, ...props }: FluriOtpSlotProps) => {
  return (
    <div
      className={cn(
        "relative flex size-11 items-center justify-center rounded-xl border-0 bg-muted/50 text-base font-medium text-foreground transition-all",
        props.isActive && "ring-2 ring-ring/50",
        hasError && "ring-2 ring-destructive/50",
      )}
    >
      {props.char !== null ? <div>{props.char}</div> : null}
      {props.char === null && props.isActive ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-0.5 animate-pulse bg-foreground/50" />
        </div>
      ) : null}
    </div>
  );
};

// Converts any stored format to DD/MM/YYYY for display
const toDisplayFormat = (val: string | undefined): string => {
  if (!val) return "";
  // YYYY-MM-DD (ISO) → DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split("-");
    return `${d}/${m}/${y}`;
  }
  // Raw 8 digits DDMMYYYY (legacy corrupt data) → DD/MM/YYYY
  if (/^\d{8}$/.test(val)) {
    return `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4, 8)}`;
  }
  // Already DD/MM/YYYY or partial display format
  return val;
};

export const FluriFieldV2Birthdate = ({
  label = "Data de nascimento",
  placeholder = "dd/mm/aaaa",
  value: controlledValue,
  onChange,
  errorMessage,
  fullWidth,
  ...props
}: FluriFieldV2CommonProps) => {
  const [derivedError, setDerivedError] = useState<string | undefined>(undefined);
  const [inputValue, setInputValue] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const {
    field,
    onValueChange: onValueChangeProp,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    onBeforeInput: onBeforeInputProp,
    onPaste: onPasteProp,
    name: inputName,
    disabled: inputDisabled,
    ...restProps
  } = props as {
    field?: V2InputFieldBinding;
  } & FluriFieldV2CommonProps;
  const externalValue = (field ? field.value : controlledValue) as string | undefined;
  const resolvedErrorMessage = field?.errorMessage ?? errorMessage ?? derivedError;

  // Sync internal display state when external value changes (e.g. loaded from DB)
  useEffect(() => {
    if (!isEditing) {
      setInputValue(toDisplayFormat(externalValue));
    }
  }, [externalValue, isEditing]);

  const displayValue = isEditing ? inputValue : toDisplayFormat(externalValue);

  const emitValue = (formatted: string) => {
    // Emit ISO (YYYY-MM-DD) when complete and valid, else emit display format
    const iso = parseDate(formatted);
    const emitted = iso ?? (formatted.length > 0 ? formatted : "");

    if (field) {
      field.onValueChange(emitted);
    }
    onValueChangeProp?.(emitted);
    if (onChange) {
      const eventTarget = { target: { value: emitted } };
      onChange(eventTarget as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <FluriFieldV2Input
      label={label}
      value={displayValue}
      errorMessage={resolvedErrorMessage}
      inputMode="numeric"
      maxLength={10}
      placeholder={placeholder}
      {...(field?.ref !== undefined ? { inputRef: field.ref } : {})}
      {...(field?.name !== undefined ? { name: field.name } : {})}
      {...(inputName !== undefined ? { name: inputName } : {})}
      {...((field?.disabled ?? inputDisabled)
        ? { disabled: field?.disabled ?? inputDisabled }
        : {})}
      {...(fullWidth !== undefined ? { fullWidth } : {})}
      {...restProps}
      onChange={(event) => {
        const formatted = formatDate(event.currentTarget.value);
        event.currentTarget.value = formatted;
        setIsEditing(true);
        setInputValue(formatted);
        setDerivedError(undefined);
        emitValue(formatted);
      }}
      onKeyDown={(event) => {
        if (shouldPreventDateKeyDown(event)) {
          event.preventDefault();
        }

        onKeyDownProp?.(event);
      }}
      onBeforeInput={(event) => {
        const nativeEvent = event.nativeEvent as InputEvent;
        if (shouldPreventDateBeforeInput(nativeEvent)) {
          event.preventDefault();
        }

        onBeforeInputProp?.(event);
      }}
      onPaste={(event) => {
        event.preventDefault();
        const formatted = formatDate(event.clipboardData.getData("text") || "");
        event.currentTarget.value = formatted;
        setIsEditing(true);
        setInputValue(formatted);
        setDerivedError(undefined);
        emitValue(formatted);
        onPasteProp?.(event);
      }}
      onFocus={(event) => {
        setIsEditing(true);
        onFocusProp?.(event);
      }}
      onBlur={(event) => {
        setIsEditing(false);
        const raw = event.currentTarget.value;
        const parsed = parseBirthdate(raw);
        const isValid = parsed !== null && parsed <= new Date();
        setDerivedError(raw && !isValid ? "Data de nascimento inválida" : undefined);

        field?.onBlur?.();
        onBlurProp?.(event);
      }}
    />
  );
};

export const FluriFieldV2Instagram = ({
  label = "Instagram",
  placeholder = "@usuario",
  value,
  onChange,
  ...props
}: FluriFieldV2CommonProps) => {
  const username = String(value ?? "")
    .replace(/^@/, "")
    .trim();

  return (
    <div className="space-y-2">
      <FluriFieldV2Input
        label={label}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          const sanitized = event.target.value
            .replace(/^@+/, "")
            .replace(/\s+/g, "")
            .replace(/[^a-zA-Z0-9._]/g, "")
            .slice(0, 30);
          event.target.value = `@${sanitized}`;
          onChange?.(event);
        }}
        {...props}
      />
      {username ? (
        <a
          href={`https://instagram.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <LinkIcon className="size-3" /> Abrir @{username}
        </a>
      ) : null}
    </div>
  );
};

export const FluriFieldV2Address = ({
  value,
  onChange,
}: {
  value: AddressData;
  onChange: (next: AddressData) => void;
}) => {
  const update = (field: keyof AddressData, nextValue: string) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <div className="space-y-3">
      <FluriFieldV2Cep
        value={value.postalCode}
        onChange={(event) => update("postalCode", event.target.value)}
        onAddressFound={(address) => {
          onChange({
            ...value,
            street: address.street,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            postalCode: formatZipCode(address.postalCode),
          });
        }}
        fullWidth
      />
      <FluriFieldV2Input
        label="Rua"
        value={value.street}
        onChange={(event) => update("street", event.target.value)}
        fullWidth
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <FluriFieldV2Input
          label="Número"
          value={value.number}
          onChange={(event) => update("number", event.target.value)}
          fullWidth
        />
        <FluriFieldV2Input
          label="Complemento"
          value={value.complement || ""}
          onChange={(event) => update("complement", event.target.value)}
          fullWidth
        />
      </div>
      <FluriFieldV2Input
        label="Bairro"
        value={value.neighborhood}
        onChange={(event) => update("neighborhood", event.target.value)}
        fullWidth
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <FluriFieldV2Input
          label="Cidade"
          value={value.city}
          onChange={(event) => update("city", event.target.value)}
          fullWidth
        />
        <FluriFieldV2Input
          label="UF"
          value={value.state}
          onChange={(event) => update("state", event.target.value.toUpperCase().slice(0, 2))}
          fullWidth
        />
      </div>
    </div>
  );
};

// Country selector with in-field search
const COUNTRIES_PT: Record<string, string> = {
  AF: "Afeganistão",
  ZA: "África do Sul",
  AL: "Albânia",
  DE: "Alemanha",
  AD: "Andorra",
  AO: "Angola",
  AG: "Antígua e Barbuda",
  SA: "Arábia Saudita",
  DZ: "Argélia",
  AR: "Argentina",
  AM: "Armênia",
  AU: "Austrália",
  AT: "Áustria",
  AZ: "Azerbaijão",
  BS: "Bahamas",
  BD: "Bangladesh",
  BB: "Barbados",
  BH: "Bahrein",
  BY: "Bielorrússia",
  BE: "Bélgica",
  BZ: "Belize",
  BJ: "Benin",
  BO: "Bolívia",
  BA: "Bósnia e Herzegovina",
  BW: "Botsuana",
  BR: "Brasil",
  BN: "Brunei",
  BG: "Bulgária",
  BF: "Burkina Faso",
  BI: "Burundi",
  BT: "Butão",
  CV: "Cabo Verde",
  CM: "Camarões",
  KH: "Camboja",
  CA: "Canadá",
  QA: "Catar",
  KZ: "Cazaquistão",
  TD: "Chade",
  CL: "Chile",
  CN: "China",
  CY: "Chipre",
  CO: "Colômbia",
  KM: "Comores",
  CG: "Congo",
  CD: "Congo (RDC)",
  KP: "Coreia do Norte",
  KR: "Coreia do Sul",
  CI: "Costa do Marfim",
  CR: "Costa Rica",
  HR: "Croácia",
  CU: "Cuba",
  DK: "Dinamarca",
  DJ: "Djibuti",
  DM: "Dominica",
  EG: "Egito",
  SV: "El Salvador",
  AE: "Emirados Árabes Unidos",
  EC: "Equador",
  ER: "Eritreia",
  SK: "Eslováquia",
  SI: "Eslovênia",
  ES: "Espanha",
  US: "Estados Unidos",
  EE: "Estônia",
  SZ: "Eswatini",
  ET: "Etiópia",
  FJ: "Fiji",
  PH: "Filipinas",
  FI: "Finlândia",
  FR: "França",
  GA: "Gabão",
  GM: "Gâmbia",
  GH: "Gana",
  GE: "Geórgia",
  GD: "Granada",
  GR: "Grécia",
  GT: "Guatemala",
  GY: "Guiana",
  GN: "Guiné",
  GW: "Guiné-Bissau",
  GQ: "Guiné Equatorial",
  HT: "Haiti",
  HN: "Honduras",
  HU: "Hungria",
  YE: "Iêmen",
  IN: "Índia",
  ID: "Indonésia",
  IR: "Irã",
  IQ: "Iraque",
  IE: "Irlanda",
  IS: "Islândia",
  IL: "Israel",
  IT: "Itália",
  JM: "Jamaica",
  JP: "Japão",
  JO: "Jordânia",
  KW: "Kuwait",
  LA: "Laos",
  LS: "Lesoto",
  LV: "Letônia",
  LB: "Líbano",
  LR: "Libéria",
  LY: "Líbia",
  LI: "Liechtenstein",
  LT: "Lituânia",
  LU: "Luxemburgo",
  MK: "Macedônia do Norte",
  MG: "Madagascar",
  MY: "Malásia",
  MW: "Malawi",
  MV: "Maldivas",
  ML: "Mali",
  MT: "Malta",
  MA: "Marrocos",
  MU: "Maurícia",
  MR: "Mauritânia",
  MX: "México",
  MM: "Mianmar",
  FM: "Micronésia",
  MZ: "Moçambique",
  MD: "Moldávia",
  MC: "Mônaco",
  MN: "Mongólia",
  ME: "Montenegro",
  NA: "Namíbia",
  NR: "Nauru",
  NP: "Nepal",
  NI: "Nicarágua",
  NE: "Níger",
  NG: "Nigéria",
  NO: "Noruega",
  NZ: "Nova Zelândia",
  OM: "Omã",
  NL: "Países Baixos",
  PW: "Palau",
  PA: "Panamá",
  PG: "Papua-Nova Guiné",
  PK: "Paquistão",
  PY: "Paraguai",
  PE: "Peru",
  PL: "Polônia",
  PT: "Portugal",
  KE: "Quênia",
  KG: "Quirguistão",
  GB: "Reino Unido",
  CF: "República Centro-Africana",
  DO: "República Dominicana",
  CZ: "República Tcheca",
  RO: "Romênia",
  RW: "Ruanda",
  RU: "Rússia",
  SB: "Ilhas Salomão",
  WS: "Samoa",
  SM: "San Marino",
  LC: "Santa Lúcia",
  KN: "São Cristóvão e Névis",
  ST: "São Tomé e Príncipe",
  VC: "São Vicente e Granadinas",
  SC: "Seychelles",
  SN: "Senegal",
  SL: "Serra Leoa",
  RS: "Sérvia",
  SG: "Singapura",
  SY: "Síria",
  SO: "Somália",
  LK: "Sri Lanka",
  SD: "Sudão",
  SS: "Sudão do Sul",
  SE: "Suécia",
  CH: "Suíça",
  SR: "Suriname",
  TJ: "Tajiquistão",
  TH: "Tailândia",
  TZ: "Tanzânia",
  TL: "Timor-Leste",
  TG: "Togo",
  TO: "Tonga",
  TT: "Trinidad e Tobago",
  TN: "Tunísia",
  TM: "Turcomenistão",
  TR: "Turquia",
  TV: "Tuvalu",
  UA: "Ucrânia",
  UG: "Uganda",
  UY: "Uruguai",
  UZ: "Uzbequistão",
  VU: "Vanuatu",
  VA: "Vaticano",
  VE: "Venezuela",
  VN: "Vietnã",
  ZM: "Zâmbia",
  ZW: "Zimbábue",
};

const countryOptionsWithSearch = Object.entries(COUNTRIES_PT)
  .map(([code, name]) => ({
    code,
    name,
  }))
  .toSorted((a, b) => {
    // Brazil first
    if (a.code === "BR") return -1;
    if (b.code === "BR") return 1;
    // Then alphabetically
    return a.name.localeCompare(b.name, "pt-BR");
  });

export const FluriFieldV2Country = ({
  label = "País",
  placeholder = "Digite para buscar...",
  value,
  onValueChange,
  helperText,
  errorMessage,
  fullWidth = true,
  disabled,
  ...props
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  field?: V2InputFieldBinding;
}) => {
  const { field, ...restProps } = props as {
    field?: V2InputFieldBinding;
  } & Omit<typeof props, "field">;

  const effectiveValue = field ? field.value : value;
  const effectiveOnValueChange = field ? field.onValueChange : onValueChange;

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fieldId = useId();

  // Get display name for selected country
  const selectedCountryName = COUNTRIES_PT[effectiveValue || "BR"] || "";

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchTerm) return countryOptionsWithSearch;
    const search = searchTerm.toLowerCase();
    return countryOptionsWithSearch.filter((country) =>
      country.name.toLowerCase().includes(search),
    );
  }, [searchTerm]);

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredCountries]);

  const handleSelect = (code: string) => {
    effectiveOnValueChange?.(code);
    setSearchTerm("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredCountries.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(
          (prev) => (prev - 1 + filteredCountries.length) % filteredCountries.length,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCountries[highlightedIndex]) {
          handleSelect(filteredCountries[highlightedIndex].code);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        break;
      default:
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedElement = listRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`,
      ) as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const hasError = Boolean(errorMessage);

  return (
    <Field data-invalid={hasError} data-size="md" className={cn(fullWidth ? "w-full" : "max-w-xs")}>
      <div className="relative">
        <div
          className={cn(
            "relative bg-muted/50 border border-transparent transition-all duration-200",
            "focus-within:ring-[3px] focus-within:ring-ring/50",
            "h-12 rounded-2xl",
            hasError && "border-destructive focus-within:ring-destructive/40",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <FieldLabel
            htmlFor={fieldId}
            className={cn(
              "absolute pointer-events-none text-muted-foreground transition-all duration-200 ease-out origin-left",
              "text-[11px] top-1.5 left-4 text-muted-foreground/80 font-semibold",
            )}
          >
            {label}
          </FieldLabel>

          <Input
            ref={inputRef}
            id={fieldId}
            type="text"
            value={isOpen ? searchTerm : selectedCountryName}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              setIsOpen(true);
              setSearchTerm("");
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsOpen(false);
                setSearchTerm("");
              }, 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={hasError}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls={`${fieldId}-listbox`}
            aria-activedescendant={isOpen ? `${fieldId}-option-${highlightedIndex}` : undefined}
            className={cn(
              "w-full border-0 bg-transparent shadow-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              "h-12 px-4 pt-5 pb-1 text-base",
              "placeholder:text-muted-foreground/50",
            )}
            {...restProps}
          />

          {isOpen && !disabled && filteredCountries.length > 0 && (
            <div
              ref={listRef}
              id={`${fieldId}-listbox`}
              role="listbox"
              className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-popover border border-border rounded-2xl shadow-lg z-50"
            >
              {filteredCountries.map((country, index) => (
                <div
                  key={country.code}
                  data-index={index}
                  id={`${fieldId}-option-${index}`}
                  role="option"
                  aria-selected={country.code === effectiveValue}
                  onClick={() => handleSelect(country.code)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(country.code);
                    }
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-colors",
                    index === highlightedIndex && "bg-accent",
                    country.code === effectiveValue && "bg-accent/50",
                  )}
                >
                  <CircleFlag
                    countryCode={country.code.toLowerCase()}
                    className="size-5 shrink-0"
                  />
                  <span className="text-sm">{country.name}</span>
                  {country.code === effectiveValue && (
                    <span
                      className="ml-auto size-1.5 rounded-full"
                      style={{
                        backgroundColor: "var(--primary)",
                        boxShadow: "0 0 0 3px color-mix(in oklab, var(--primary) 22%, transparent)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {isOpen && !disabled && filteredCountries.length === 0 && searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
              Nenhum país encontrado
            </div>
          )}
        </div>

        {(helperText || hasError) && (
          <div className="mt-1.5 px-1">
            {hasError ? (
              <FieldError className="text-xs">{errorMessage}</FieldError>
            ) : helperText ? (
              <FieldDescription className="text-xs">{helperText}</FieldDescription>
            ) : null}
          </div>
        )}
      </div>
    </Field>
  );
};

export { FluriFieldV2DateSegmented } from "./fluri-field-v2-date-segmented.component";
export type { FluriFieldV2DateSegmentedProps } from "./fluri-field-v2-date-segmented.component";
export { FluriFieldV2DateSegmentedWithPicker } from "./fluri-field-v2-date-segmented-with-picker.component";
export type { FluriFieldV2DateSegmentedWithPickerProps } from "./fluri-field-v2-date-segmented-with-picker.component";
export { FluriFieldV2TimeSegmented } from "./fluri-field-v2-time-segmented.component";
export type { FluriFieldV2TimeSegmentedProps } from "./fluri-field-v2-time-segmented.component";
