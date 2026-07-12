"use client";

import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { cn } from "@workspace/ui/lib/utils";

interface CheckboxOption {
  value: number | string;
  label: string;
  description?: string;
}

interface CheckboxGroupFieldHookFormProps {
  name: string;
  label: string;
  options: CheckboxOption[];
  required?: boolean;
  min?: number;
  max?: number;
  helpText?: string;
  disabled?: boolean;
}

export function CheckboxGroupFieldHookForm({
  name,
  label,
  options,
  required = false,
  min,
  max,
  helpText,
  disabled = false,
}: CheckboxGroupFieldHookFormProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedValues = (watch(name) as (number | string)[]) || [];
  const error = errors[name]?.message as string | undefined;

  const handleToggle = (value: number | string) => {
    if (disabled) return;

    const currentValues = selectedValues;
    const isSelected = currentValues.includes(value);

    let newValues: (number | string)[];
    if (isSelected) {
      newValues = currentValues.filter((v) => v !== value);
    } else {
      if (max && currentValues.length >= max) {
        return;
      }
      newValues = [...currentValues, value];
    }

    setValue(name, newValues, { shouldValidate: true });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-gray-900 block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {(min || max) && (
          <span className="text-xs text-gray-500">
            {selectedValues.length}
            {min && ` / mín. ${min}`}
            {max && ` / máx. ${max}`}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          const isMaxReached = max ? selectedValues.length >= max : false;
          const isDisabled = disabled || (isMaxReached && !isSelected);

          return (
            <label
              key={String(option.value)}
              aria-label={option.label}
              className={cn(
                "relative flex cursor-pointer rounded-lg border p-4 transition-all",
                isSelected && "border-brand-primary bg-brand-primary/5",
                !isSelected && !error && "border-gray-200 hover:border-gray-300",
                error && !isSelected && "border-red-500",
                isDisabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(option.value)}
                disabled={isDisabled}
                className="sr-only"
              />

              <div className="flex flex-1 items-start">
                <div
                  className={cn(
                    "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                    isSelected
                      ? "border-brand-primary bg-brand-primary"
                      : "border-gray-300 bg-white",
                  )}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                </div>

                <div className="ml-3 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-medium",
                      isSelected ? "text-gray-900" : "text-gray-700",
                    )}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="block text-sm text-gray-500 mt-1">{option.description}</span>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
