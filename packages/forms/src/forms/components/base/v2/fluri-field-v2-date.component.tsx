"use client";

import { useState } from "react";

import { formatDate } from "@workspace/forms/fields/utils/date-formatting";
import { parseBirthdate } from "@workspace/forms/utils/formatting";
import { shouldPreventDateBeforeInput, shouldPreventDateKeyDown } from "./date-input-guards";
import { FluriFieldV2Input, type FluriFieldV2InputProps } from "./fluri-field-v2-input.component";

type FluriFieldV2DateProps = Omit<FluriFieldV2InputProps, "type">;

const validateDateString = (value: string): string | undefined => {
  if (!value) return undefined;

  const digits = value.replace(/\D/g, "");
  if (digits.length < 8) return "Data incompleta";

  const day = Number.parseInt(digits.slice(0, 2), 10);
  const month = Number.parseInt(digits.slice(2, 4), 10);
  const year = Number.parseInt(digits.slice(4, 8), 10);
  const currentYear = new Date().getFullYear();

  if (day < 1 || day > 31) return "Dia inválido (01-31)";
  if (month < 1 || month > 12) return "Mês inválido (01-12)";
  if (year < 1900 || year > currentYear) return `Ano inválido (1900-${currentYear})`;

  const parsed = parseBirthdate(value);
  if (!parsed) return "Data inválida";

  if (parsed > new Date()) return "Data não pode ser no futuro";
  return undefined;
};

const FluriFieldV2Date = ({
  label,
  placeholder = "dd/mm/aaaa",
  errorMessage,
  onChange,
  onBlur,
  onValueChange,
  onKeyDown,
  onBeforeInput,
  onPaste,
  ...props
}: FluriFieldV2DateProps) => {
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const resolvedErrorMessage = errorMessage ?? localError;

  return (
    <FluriFieldV2Input
      {...(label !== undefined && { label })}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      maxLength={10}
      showClearButton={false}
      {...(resolvedErrorMessage !== undefined && { errorMessage: resolvedErrorMessage })}
      onChange={(event) => {
        event.target.value = formatDate(event.target.value);
        onValueChange?.(event.target.value);
        onChange?.(event);
      }}
      onBlur={(event) => {
        setLocalError(validateDateString(event.target.value));
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (shouldPreventDateKeyDown(event)) {
          event.preventDefault();
        }
        onKeyDown?.(event);
      }}
      onBeforeInput={(event) => {
        const nativeEvent = event.nativeEvent as InputEvent;
        if (shouldPreventDateBeforeInput(nativeEvent)) {
          event.preventDefault();
        }
        onBeforeInput?.(event);
      }}
      onPaste={(event) => {
        event.preventDefault();
        const raw = event.clipboardData.getData("text") || "";
        const formatted = formatDate(raw);
        event.currentTarget.value = formatted;

        const syntheticEvent = {
          ...event,
          target: { ...event.currentTarget, value: formatted },
          currentTarget: { ...event.currentTarget, value: formatted },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onValueChange?.(formatted);
        onChange?.(syntheticEvent);
        onPaste?.(event);
      }}
      {...Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined))}
    />
  );
};

export { FluriFieldV2Date };
export default FluriFieldV2Date;
