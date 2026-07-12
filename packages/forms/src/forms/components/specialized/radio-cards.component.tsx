"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@workspace/ui/lib/utils";

interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
}

interface RadioCardsFieldHookFormProps {
  name: string;
  label: string;
  options: RadioOption[];
  required?: boolean;
  helpText?: string;
  disabled?: boolean;
}

export function RadioCardsFieldHookForm({
  name,
  label,
  options,
  required = false,
  helpText,
  disabled = false,
}: RadioCardsFieldHookFormProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const selectedValue = watch(name);
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-gray-900 block">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected =
            selectedValue === option.value || String(selectedValue) === String(option.value);

          return (
            <label
              key={String(option.value)}
              className={cn(
                "relative flex cursor-pointer rounded-lg border p-4 transition-all",
                isSelected && "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary",
                !isSelected && !error && "border-gray-200 hover:border-gray-300",
                error && !isSelected && "border-red-500",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <input
                type="radio"
                {...register(name, {
                  required: required ? `${label} é obrigatório` : false,
                  valueAsNumber: typeof option.value === "number",
                })}
                value={option.value}
                disabled={disabled}
                className="sr-only"
              />

              <div className="flex flex-1 items-start">
                <div
                  className={cn(
                    "mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected ? "border-brand-primary" : "border-gray-300",
                  )}
                >
                  {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-brand-primary" />}
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
