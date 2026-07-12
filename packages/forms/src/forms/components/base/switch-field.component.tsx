"use client";

import { useId } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";

export type SwitchFieldSize = "sm" | "md" | "lg";
export type SwitchFieldVariant = "default";
export type SwitchFieldLabelPosition = "top" | "side" | "none";

export interface SwitchFieldProps {
  ref?: React.Ref<React.ComponentRef<typeof Switch>>;
  label?: string;

  helperText?: string;

  errorMessage?: string;

  size?: SwitchFieldSize;

  variant?: SwitchFieldVariant;

  labelPosition?: SwitchFieldLabelPosition;

  containerClassName?: string;

  labelClassName?: string;

  helperTextClassName?: string;

  hideLabel?: boolean;

  offLabel?: React.ReactNode;

  onLabel?: React.ReactNode;

  showSideLabels?: boolean;

  checked?: boolean;

  defaultChecked?: boolean;

  onCheckedChange?: (checked: boolean) => void;

  disabled?: boolean;

  required?: boolean;

  switchProps?: React.ComponentProps<typeof Switch>;

  value?: boolean;
  onChange?: (checked: boolean) => void;
}

const SwitchField = ({
  label,
  helperText,
  errorMessage,
  size = "md",
  variant = "default",
  labelPosition = "top",
  containerClassName,
  labelClassName,
  helperTextClassName,
  hideLabel = false,
  offLabel = "Off",
  onLabel = "On",
  showSideLabels = false,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  required = false,
  switchProps,
  value,
  onChange,
  ref,
}: SwitchFieldProps) => {
  const id = useId();

  const sizeClasses = {
    sm: {
      switch:
        "h-5 w-9 [&_[data-slot=switch-thumb]]:size-4 data-[state=checked]:[&_[data-slot=switch-thumb]]:translate-x-4 data-[state=unchecked]:[&_[data-slot=switch-thumb]]:translate-x-0",
      label: "text-xs",
      sideLabel: "text-xs",
    },
    md: {
      switch:
        "h-6 w-11 [&_[data-slot=switch-thumb]]:size-5 data-[state=checked]:[&_[data-slot=switch-thumb]]:translate-x-5 data-[state=unchecked]:[&_[data-slot=switch-thumb]]:translate-x-0",
      label: "text-sm",
      sideLabel: "text-sm",
    },
    lg: {
      switch:
        "h-7 w-13 [&_[data-slot=switch-thumb]]:size-6 data-[state=checked]:[&_[data-slot=switch-thumb]]:translate-x-6 data-[state=unchecked]:[&_[data-slot=switch-thumb]]:translate-x-0",
      label: "text-base",
      sideLabel: "text-base",
    },
  } as const;

  const variantClasses = {
    default: "",
  } as const;

  const resolvedChecked = typeof checked !== "undefined" ? checked : value;

  const switchComponent = (
    <Switch
      ref={ref}
      id={id}
      {...(resolvedChecked !== undefined ? { checked: resolvedChecked } : {})}
      defaultChecked={defaultChecked}
      onCheckedChange={(next) => {
        onCheckedChange?.(next);
        onChange?.(next);
      }}
      disabled={disabled}
      className={cn(
        sizeClasses[size].switch,
        "cursor-pointer disabled:cursor-default",
        variantClasses[variant],
        switchProps?.className,
      )}
      aria-describedby={
        (helperText && !errorMessage) || errorMessage ? `${id}-description` : undefined
      }
      aria-invalid={!!errorMessage}
      aria-required={required}
      {...switchProps}
    />
  );

  const renderMainLabel = () => {
    if (!label || hideLabel) return null;

    return (
      <FieldLabel
        htmlFor={id}
        className={cn(
          sizeClasses[size].label,
          {
            "sr-only": labelPosition === "none",
          },
          labelClassName,
        )}
      >
        {label}
        {required && <span className="text-destructive">*</span>}
      </FieldLabel>
    );
  };

  const renderSideLabels = () => {
    if (!showSideLabels) return switchComponent;

    return (
      <div
        className="group inline-flex items-center gap-2"
        data-state={resolvedChecked ? "checked" : "unchecked"}
      >
        <button
          type="button"
          id={`${id}-off`}
          className={cn(
            "group-data-[state=checked]:text-muted-foreground/70 flex-1 text-right font-medium",
            sizeClasses[size].sideLabel,
            {
              "cursor-not-allowed opacity-50": disabled,
            },
          )}
          aria-controls={id}
          onClick={() => {
            if (disabled) return;
            onCheckedChange?.(false);
            onChange?.(false);
          }}
          disabled={disabled}
        >
          {offLabel}
        </button>
        {switchComponent}
        <button
          type="button"
          id={`${id}-on`}
          className={cn(
            "group-data-[state=unchecked]:text-muted-foreground/70 flex-1 text-left font-medium",
            sizeClasses[size].sideLabel,
            {
              "cursor-not-allowed opacity-50": disabled,
            },
          )}
          aria-controls={id}
          onClick={() => {
            if (disabled) return;
            onCheckedChange?.(true);
            onChange?.(true);
          }}
          disabled={disabled}
        >
          {onLabel}
        </button>
      </div>
    );
  };

  if (labelPosition === "side") {
    return (
      <Field
        orientation="horizontal"
        data-invalid={!!errorMessage}
        data-disabled={disabled}
        data-size={size}
        className={cn(containerClassName)}
      >
        {renderSideLabels()}
        {renderMainLabel()}

        {helperText && !errorMessage && (
          <FieldDescription className={helperTextClassName}>{helperText}</FieldDescription>
        )}

        {errorMessage && <FieldError>{errorMessage}</FieldError>}
      </Field>
    );
  }

  return (
    <Field
      data-invalid={!!errorMessage}
      data-disabled={disabled}
      data-size={size}
      className={cn(containerClassName)}
    >
      {renderMainLabel()}

      <div>{renderSideLabels()}</div>

      {helperText && !errorMessage && (
        <FieldDescription className={helperTextClassName}>{helperText}</FieldDescription>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
};

export default SwitchField;
