"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { Monitor as ComputerDesktopIcon, Moon as MoonIcon, Sun as SunIcon } from "lucide-react";
import { useId } from "react";

const THEME_OPTIONS = [
  {
    value: "light",
    label: "Claro",
    icon: SunIcon,
  },
  {
    value: "dark",
    label: "Escuro",
    icon: MoonIcon,
  },
  {
    value: "system",
    label: "Sistema",
    icon: ComputerDesktopIcon,
  },
] as const;

export type ThemeToggleValue = "light" | "dark" | "system";

export type ThemeToggleFieldSize = "sm" | "md" | "lg";
export type ThemeToggleFieldVariant = "default" | "outline" | "ghost";

export interface ThemeToggleFieldProps {
  ref?: React.Ref<HTMLButtonElement>;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  size?: ThemeToggleFieldSize;
  variant?: ThemeToggleFieldVariant;
  containerClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  required?: boolean;
  value?: ThemeToggleValue;
  onChange?: (value: ThemeToggleValue) => void;
  icons?: {
    light?: React.ReactNode;
    dark?: React.ReactNode;
    system?: React.ReactNode;
  };
  options?: Array<{
    value: ThemeToggleValue;
    label: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }>;
}

const ThemeToggleField = ({
  label,
  helperText,
  errorMessage,
  size = "md",
  variant = "default",
  containerClassName,
  labelClassName,
  helperTextClassName,
  hideLabel = false,
  disabled = false,
  required = false,
  value,
  onChange,
  icons,
  options,
  ref,
  ...props
}: ThemeToggleFieldProps) => {
  const id = useId();
  const fieldId = `${id}-field`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const displayOptions = options || THEME_OPTIONS;
  const selectedOption =
    displayOptions.find((option) => option.value === value) || displayOptions[0];

  // Get the current icon - handle both custom icons and default theme options
  const getCurrentIcon = () => {
    if (icons?.[value as ThemeToggleValue]) {
      return icons[value as ThemeToggleValue];
    }
    // For default theme options, use the icon from the option
    if ("icon" in selectedOption) {
      return selectedOption.icon;
    }
    return null;
  };

  const CurrentIcon = getCurrentIcon();

  const handleSelect = (selectedValue: ThemeToggleValue) => {
    onChange?.(selectedValue);
  };

  return (
    <Field className={cn("space-y-2", containerClassName)}>
      {label && !hideLabel && (
        <FieldLabel className={labelClassName} htmlFor={fieldId}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </FieldLabel>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <BrandButton
            ref={ref}
            variant={variant === "outline" ? "ghost" : variant}
            size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
            disabled={disabled}
            className="w-full justify-start"
            id={fieldId}
            aria-describedby={helperText ? descriptionId : errorMessage ? errorId : undefined}
            {...props}
          >
            {CurrentIcon && typeof CurrentIcon === "function" && (
              <CurrentIcon className="mr-2 h-4 w-4" />
            )}
            {selectedOption.label}
          </BrandButton>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-48 p-0">
          <div className="flex flex-col">
            {displayOptions.map((option) => {
              // Get the icon for this option
              const getOptionIcon = () => {
                if (icons?.[option.value as ThemeToggleValue]) {
                  return icons[option.value as ThemeToggleValue];
                }
                // For default theme options, use the icon from the option
                if ("icon" in option) {
                  return option.icon;
                }
                return null;
              };

              const Icon = getOptionIcon();
              const isSelected = value === option.value;

              return (
                <BrandButton
                  key={option.value}
                  variant={isSelected ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleSelect(option.value)}
                  className="flex justify-start gap-2 rounded-none border-0"
                >
                  {Icon && typeof Icon === "function" && <Icon className="h-4 w-4" />}
                  <span className="flex-1">{option.label}</span>
                  {isSelected && (
                    <div
                      className="bg-primary h-2 w-2 flex-shrink-0 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </BrandButton>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {helperText && !errorMessage && (
        <FieldDescription className={helperTextClassName} id={descriptionId}>
          {helperText}
        </FieldDescription>
      )}

      {errorMessage && <FieldError id={errorId}>{errorMessage}</FieldError>}
    </Field>
  );
};

export default ThemeToggleField;
