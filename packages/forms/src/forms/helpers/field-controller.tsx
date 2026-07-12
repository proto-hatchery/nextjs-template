"use client";

import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import type { ReactNode } from "react";
import {
  Controller,
  useFormContext,
  type ControllerFieldState,
  type ControllerProps,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

interface BaseControlledFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  hideLabel?: boolean;
}

export function ControlledField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  required,
  hideLabel,
  render,
  ...controllerProps
}: BaseControlledFieldProps<TFieldValues, TName> &
  Omit<ControllerProps<TFieldValues, TName>, "render"> & {
    render: (props: {
      field: ControllerRenderProps<TFieldValues, TName>;
      fieldState: ControllerFieldState;
    }) => ReactNode;
  }) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      name={name}
      control={control}
      {...controllerProps}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && !hideLabel && (
            <FieldLabel htmlFor={field.name} {...(required !== undefined ? { required } : {})}>
              {label}
            </FieldLabel>
          )}

          {render({ field, fieldState })}

          {description && !fieldState.invalid && <FieldDescription>{description}</FieldDescription>}

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function InputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  required,
  hideLabel,
  type = "text",
  placeholder,
  ...inputProps
}: BaseControlledFieldProps<TFieldValues, TName> & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <ControlledField
      name={name}
      {...(label !== undefined ? { label } : {})}
      {...(description !== undefined ? { description } : {})}
      {...(required !== undefined ? { required } : {})}
      {...(hideLabel !== undefined ? { hideLabel } : {})}
      render={({ field, fieldState }) => (
        <Input
          {...field}
          {...inputProps}
          id={field.name}
          type={type}
          placeholder={placeholder}
          aria-invalid={fieldState.invalid}
        />
      )}
    />
  );
}

export function TextareaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  required,
  hideLabel,
  rows = 4,
  placeholder,
  ...textareaProps
}: BaseControlledFieldProps<TFieldValues, TName> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <ControlledField
      name={name}
      {...(label !== undefined ? { label } : {})}
      {...(description !== undefined ? { description } : {})}
      {...(required !== undefined ? { required } : {})}
      {...(hideLabel !== undefined ? { hideLabel } : {})}
      render={({ field, fieldState }) => (
        <Textarea
          {...field}
          {...textareaProps}
          id={field.name}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={fieldState.invalid}
        />
      )}
    />
  );
}

export function SpecializedField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TComponentProps extends Record<string, unknown> = Record<string, unknown>,
>({
  name,
  label,
  description,
  required,
  hideLabel,
  component: Component,
  ...componentProps
}: BaseControlledFieldProps<TFieldValues, TName> & {
  component: React.ComponentType<TComponentProps>;
} & TComponentProps) {
  return (
    <ControlledField
      name={name}
      {...(label !== undefined ? { label } : {})}
      {...(description !== undefined ? { description } : {})}
      {...(required !== undefined ? { required } : {})}
      {...(hideLabel !== undefined ? { hideLabel } : {})}
      render={({ field, fieldState }) => (
        <Component
          {...(field as unknown as TComponentProps)}
          {...componentProps}
          id={field.name}
          aria-invalid={fieldState.invalid}
        />
      )}
    />
  );
}
