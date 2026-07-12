import { type ComponentType, type SVGProps, useId } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Label } from "@workspace/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { cn } from "@workspace/ui/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
}

export interface RadioFieldProps {
  label?: string;

  helperText?: string;

  errorMessage?: string;

  options: RadioOption[];

  defaultValue?: string;

  value?: string;

  onValueChange?: (value: string) => void;

  disabled?: boolean;

  className?: string;

  containerClassName?: string;

  labelClassName?: string;

  helperTextClassName?: string;

  hideLabel?: boolean;

  orientation?: "vertical" | "horizontal";

  variant?: "default" | "card" | "inline";

  name?: string;

  required?: boolean;

  "aria-label"?: string;

  "aria-describedby"?: string;
}

export default function RadioField({
  label,
  helperText,
  errorMessage,
  options,
  defaultValue,
  value,
  onValueChange,
  disabled = false,
  className,
  containerClassName,
  labelClassName,
  helperTextClassName,
  hideLabel = false,
  orientation = "vertical",
  variant = "default",
  name,
  required = false,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: RadioFieldProps) {
  const id = useId();

  const getRadioGroupClassName = () => {
    const baseClasses = "";

    if (variant === "card") {
      return cn(
        baseClasses,
        "grid gap-3",
        orientation === "horizontal" ? "grid-cols-2" : "grid-cols-1",
      );
    }

    if (variant === "inline") {
      return cn(baseClasses, "flex gap-1.5");
    }

    return cn(baseClasses, orientation === "horizontal" ? "flex gap-6" : "space-y-2");
  };

  const getItemClassName = (option: RadioOption) => {
    void option;
    if (variant === "card") {
      return "border-input has-data-[state=checked]:border-primary/50 relative flex flex-col gap-4 rounded-md border p-4 shadow-xs outline-none";
    }

    if (variant === "inline") {
      return "border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex size-9 cursor-pointer flex-col items-center justify-center rounded-full border text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50";
    }

    return "";
  };

  const renderOption = (option: RadioOption) => {
    const itemId = `${id}-${option.value}`;
    const isDisabled = disabled || option.disabled;

    if (variant === "card") {
      return (
        <div key={itemId} className={getItemClassName(option)}>
          <div className="flex justify-between gap-2">
            <RadioGroupItem
              id={itemId}
              value={option.value}
              disabled={isDisabled}
              className="order-1 after:absolute after:inset-0"
            />
            {option.icon && (
              <option.icon className="opacity-60" width={16} height={16} aria-hidden="true" />
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor={itemId} className={isDisabled ? "opacity-50" : ""}>
              {option.label}
            </Label>
            {option.description && (
              <p className="text-muted-foreground text-xs">{option.description}</p>
            )}
          </div>
        </div>
      );
    }

    if (variant === "inline") {
      return (
        <label key={itemId} className={getItemClassName(option)} htmlFor={itemId}>
          <RadioGroupItem
            id={itemId}
            value={option.value}
            disabled={isDisabled}
            className="sr-only after:absolute after:inset-0"
          />
          {option.label}
        </label>
      );
    }

    return (
      <div key={itemId} className="flex items-start gap-2">
        <RadioGroupItem
          id={itemId}
          value={option.value}
          disabled={isDisabled}
          aria-describedby={option.description ? `${itemId}-description` : undefined}
          className="cursor-pointer disabled:cursor-default"
        />
        <div className="grid grow gap-2">
          <Label htmlFor={itemId} className={cn("text-sm font-medium", isDisabled && "opacity-50")}>
            {option.label}
          </Label>
          {option.description && (
            <p id={`${itemId}-description`} className="text-muted-foreground text-xs">
              {option.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Field
      data-invalid={!!errorMessage}
      data-disabled={disabled}
      className={cn(containerClassName)}
    >
      {label && !hideLabel && (
        <FieldLabel className={labelClassName}>
          {label}
          {required && <span className="text-destructive">*</span>}
        </FieldLabel>
      )}

      <RadioGroup
        {...(value !== undefined ? { value } : {})}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        {...(onValueChange !== undefined ? { onValueChange } : {})}
        disabled={disabled}
        className={cn(getRadioGroupClassName(), className)}
        {...(name !== undefined ? { name } : {})}
        aria-label={ariaLabel || label}
        {...(ariaDescribedBy !== undefined ? { "aria-describedby": ariaDescribedBy } : {})}
        aria-required={required}
      >
        {options.map(renderOption)}
      </RadioGroup>

      {helperText && !errorMessage && (
        <FieldDescription className={helperTextClassName}>{helperText}</FieldDescription>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
}
