"use client";

import TextField from "@workspace/forms/components/base/text-field.component";

import type { ZipCodeFieldProps } from "@workspace/forms/types";
import { formatZipCode } from "@workspace/forms/utils/formatting";

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

export const ZipCodeField = ({
  onChange,
  placeholder = "00000-000",
  ...props
}: ZipCodeFieldProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 8);
    const formatted = formatZipCode(digitsOnly);
    event.target.value = formatted;
    onChange?.(event);
  };

  return (
    <TextField
      type="text"
      inputMode="numeric"
      pattern="\d*"
      autoComplete="postal-code"
      placeholder={placeholder}
      maxLength={9}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
};

ZipCodeField.displayName = "ZipCodeField";

export const ZipCodeInput = ZipCodeField;

export default ZipCodeInput;
