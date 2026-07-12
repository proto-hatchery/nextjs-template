"use client";

import type { TextFieldProps } from "@workspace/forms/components/base/text-field.component";
import TextField from "@workspace/forms/components/base/text-field.component";

export interface RgFieldProps extends Omit<TextFieldProps, "type"> {
  displayMode?: boolean;
  onValueChange?: (value: string) => void;
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
};

const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  e.preventDefault();
  const raw = e.clipboardData.getData("text") || "";
  const digitsOnly = raw.replace(/\D/g, "").slice(0, 9);
  const target = e.currentTarget;
  target.value = digitsOnly;
  target.dispatchEvent(new Event("input", { bubbles: true }));
};

export const RgField = ({
  onValueChange,
  onChange,
  placeholder = "Digite seu RG",
  ...props
}: RgFieldProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, "");
    const syntheticEvent = {
      ...event,
      target: {
        ...event.target,
        value: digitsOnly,
      },
    };
    onValueChange?.(digitsOnly);
    onChange?.(syntheticEvent);
  };

  return (
    <TextField
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      maxLength={9}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBeforeInput={handleBeforeInput}
      onPaste={handlePaste}
      {...props}
    />
  );
};

RgField.displayName = "RgField";

export default RgField;
