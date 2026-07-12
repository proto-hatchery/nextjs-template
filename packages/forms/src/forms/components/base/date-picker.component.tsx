"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";
import TextField from "@workspace/forms/components/base/text-field.component";
import { Calendar } from "@workspace/ui/components/calendar";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { formatDate, formatDateToString, parseDate } from "@workspace/forms/fields/utils/date-formatting";

export type DatePickerFieldSize = "sm" | "md" | "lg";
export type DatePickerFieldVariant = "default" | "ghost";

export interface DatePickerFieldProps {
  label?: string;

  helperText?: string;

  errorMessage?: string;

  size?: DatePickerFieldSize;

  variant?: DatePickerFieldVariant;

  containerClassName?: string;

  labelClassName?: string;

  helperTextClassName?: string;

  inputClassName?: string;

  hideLabel?: boolean;

  value?: Date;

  defaultValue?: Date;

  onChange?: (value: Date | undefined) => void;

  disabled?: boolean;

  required?: boolean;

  isInvalid?: boolean;

  displayFormat?: string;
}

const iconSizes: Record<DatePickerFieldSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

const toCalendarDate = (value?: Date | null) => {
  if (!value) return null;
  return value;
};

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
    "/",
  ];
  const isDigit = e.key >= "0" && e.key <= "9";
  if (!isDigit && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};

const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
  const nativeEvent = e.nativeEvent as unknown as { data?: string; inputType?: string };
  const data = nativeEvent.data ?? "";
  const inputType = nativeEvent.inputType ?? "";
  const isDeletion = inputType.startsWith("delete");

  if (!isDeletion && data !== "/" && /\D/.test(data)) {
    e.preventDefault();
  }

  if (!isDeletion) {
    const digits = e.currentTarget.value.replace(/\D/g, "");
    if (digits.length >= 8 && data !== "/") {
      e.preventDefault();
    }
  }
};

const DatePickerField = ({
  label,
  helperText,
  errorMessage,
  size = "md",
  variant = "default",
  containerClassName,
  labelClassName,
  helperTextClassName,
  inputClassName,
  hideLabel = false,
  value: controlledValue,
  defaultValue,
  onChange,
  disabled = false,
  required = false,
  isInvalid = false,
  displayFormat: _displayFormat = "PPP",
}: DatePickerFieldProps) => {
  const id = useId();
  void _displayFormat;
  const [inputValue, setInputValue] = useState<string>(() => {
    if (controlledValue) return formatDateToString(controlledValue);
    if (defaultValue) return formatDateToString(defaultValue);
    return "";
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  const finalIsInvalid = isInvalid || !!errorMessage;
  const calendarValue = useMemo(
    () => toCalendarDate(controlledValue ?? defaultValue ?? null),
    [controlledValue, defaultValue],
  );

  const displayValue = useMemo(() => {
    if (controlledValue) {
      return formatDateToString(controlledValue);
    }
    return inputValue;
  }, [controlledValue, inputValue]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    const rawValue = target.value;

    const formatted = formatDate(rawValue);

    setInputValue(formatted);

    const parsedISO = parseDate(formatted);
    if (parsedISO) {
      const [yStr, mStr, dStr] = parsedISO.split("-");
      const jsDate = new Date(Number(yStr), Number(mStr) - 1, Number(dStr));
      onChange?.(jsDate);
    } else if (formatted.length === 0) {
      onChange?.(undefined);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text") || "";
    const formatted = formatDate(raw);
    const target = e.currentTarget;
    target.value = formatted;
    setInputValue(formatted);

    const parsedISO = parseDate(formatted);
    if (parsedISO) {
      const [yStr, mStr, dStr] = parsedISO.split("-");
      const jsDate = new Date(Number(yStr), Number(mStr) - 1, Number(dStr));
      onChange?.(jsDate);
    }
  };

  const handleCalendarChange = (date: Date | undefined) => {
    if (!date) {
      onChange?.(undefined);
      setInputValue("");
      setCalendarOpen(false);
      return;
    }

    const formatted = formatDateToString(date);

    setInputValue(formatted);
    onChange?.(date);
    setCalendarOpen(false);
  };

  return (
    <Field
      data-invalid={finalIsInvalid}
      data-disabled={disabled}
      data-size={size}
      className={cn(containerClassName)}
    >
      {label && !hideLabel && (
        <FieldLabel
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
          {required && <span className="text-destructive">*</span>}
        </FieldLabel>
      )}

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <TextField
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/aaaa"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBeforeInput={handleBeforeInput}
          onPaste={handlePaste}
          disabled={disabled}
          required={required}
          size={size}
          variant={variant}
          hideLabel
          {...(inputClassName !== undefined ? { containerClassName: inputClassName } : {})}
          endIcon={
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "text-muted-foreground/80 flex items-center justify-center",
                  "outline-none focus-visible:outline-none",
                  "pointer-events-auto",
                  {
                    "cursor-not-allowed opacity-50": disabled,
                  },
                  !disabled && "cursor-pointer",
                )}
                aria-label="Abrir calendário"
                disabled={disabled}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
              >
                <CalendarIcon size={iconSizes[size]} />
              </button>
            </PopoverTrigger>
          }
          aria-describedby={
            (helperText && !errorMessage) || errorMessage ? `${id}-description` : undefined
          }
          aria-invalid={finalIsInvalid}
        />
        <PopoverContent align="end" side="bottom" className="p-2" sideOffset={4}>
          {calendarOpen && (
            <Calendar
              mode="single"
              selected={calendarValue ?? undefined}
              onSelect={handleCalendarChange}
            />
          )}
        </PopoverContent>
      </Popover>

      {helperText && !errorMessage && (
        <FieldDescription className={helperTextClassName}>{helperText}</FieldDescription>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
};

DatePickerField.displayName = "DatePickerField";

export default DatePickerField;
