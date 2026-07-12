"use client";

import type * as React from "react";
import type { TextFieldProps } from "@workspace/forms/components/base/text-field.component";
import TextField from "@workspace/forms/components/base/text-field.component";

import { formatCrp } from "@workspace/forms/utils/formatting";

export interface CrpFieldProps extends Omit<TextFieldProps, "type"> {
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
    "-",
  ];
  const isDigit = e.key >= "0" && e.key <= "9";
  if (!isDigit && !allowedKeys.includes(e.key)) e.preventDefault();
};

const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
  const nativeEvent = e.nativeEvent as unknown as { data?: string; inputType?: string };
  const data = nativeEvent.data ?? "";
  const isDeletion = nativeEvent.inputType?.startsWith("delete") ?? false;
  if (isDeletion) return;
  if (data && !/[\d-]/.test(data)) e.preventDefault();
};

export const CrpField = ({
  onValueChange,
  onChange,
  onBlur,
  placeholder = "Insira seu CRP",
  ...props
}: CrpFieldProps) => {
  const applyMask = (target: HTMLInputElement) => {
    const formatted = formatCrp(target.value);
    if (target.value !== formatted) {
      const selectionFromEnd = target.value.length - (target.selectionStart ?? target.value.length);
      target.value = formatted;
      if (target === document.activeElement) {
        const nextPos = Math.max(0, formatted.length - selectionFromEnd);
        target.setSelectionRange(nextPos, nextPos);
      }
    }
    onValueChange?.(formatted);
    return formatted;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    applyMask(event.currentTarget);
    onChange?.(event);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text") || "";
    const target = e.currentTarget;
    target.value = raw;
    applyMask(target);
    target.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    applyMask(event.currentTarget);
    onBlur?.(event);
  };

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
      {...props}
    />
  );
};

CrpField.displayName = "CrpField";
