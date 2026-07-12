"use client";

import type { TextFieldProps } from "@workspace/forms/components/base/text-field.component";
import TextField from "@workspace/forms/components/base/text-field.component";
import type * as React from "react";
import { useState } from "react";

import { formatCpf } from "@workspace/forms/utils/formatting";
import { isValidCpf } from "@workspace/forms/utils/validation";

export interface CpfFieldProps extends Omit<TextFieldProps, "type"> {
  displayMode?: boolean;
  onValueChange?: (value: string) => void;
  validateOnBlur?: boolean;
}

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.metaKey || e.ctrlKey) return;
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "Enter",
  ];
  const isDigit = e.key >= "0" && e.key <= "9";
  if (!isDigit && !allowedKeys.includes(e.key)) e.preventDefault();
};

const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
  const nativeEvent = e.nativeEvent as unknown as { data?: string; inputType?: string };
  const data = nativeEvent.data ?? "";
  const inputType = nativeEvent.inputType ?? "";
  const isDeletion = inputType.startsWith("delete");
  if (!isDeletion && /\D/.test(data)) e.preventDefault();
  if (!isDeletion) {
    const digits = e.currentTarget.value.replace(/\D/g, "");
    if (digits.length >= 11) e.preventDefault();
  }
};

const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  e.preventDefault();
  const raw = e.clipboardData.getData("text") || "";
  const digitsOnly = raw.replace(/\D/g, "");
  const formatted = formatCpf(digitsOnly);
  const target = e.currentTarget;
  target.value = formatted;

  target.dispatchEvent(new Event("input", { bubbles: true }));
};

export const CpfField = ({
  onValueChange,
  onChange,
  onBlur,
  validateOnBlur = false,
  placeholder = "000.000.000-00",
  errorMessage: propErrorMessage,
  ...props
}: CpfFieldProps) => {
  const [validationError, setValidationError] = useState<string>();
  const applyMask = (target: HTMLInputElement) => {
    const digitsOnly = target.value.replace(/\D/g, "");
    const formatted = formatCpf(digitsOnly);
    if (target.value !== formatted) {
      target.value = formatted;
    }
    onValueChange?.(formatted);
    return formatted;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    applyMask(target);
    onChange?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    applyMask(target);

    // Validate on blur if enabled
    if (validateOnBlur) {
      const value = target.value;
      if (value && !isValidCpf(value)) {
        setValidationError("CPF inválido");
      } else {
        setValidationError(undefined);
      }
    }

    onBlur?.(event);
  };

  const errorMessage = propErrorMessage || validationError;
  return (
    <TextField
      type="text"
      inputMode="numeric"
      pattern="\d*"
      autoComplete="off"
      placeholder={placeholder}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBeforeInput={handleBeforeInput}
      onPaste={handlePaste}
      onBlur={handleBlur}
      {...(errorMessage !== undefined ? { errorMessage } : {})}
      {...props}
    />
  );
};

CpfField.displayName = "CpfField";
