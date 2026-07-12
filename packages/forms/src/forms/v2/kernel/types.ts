import type * as React from "react";
import type { FieldError } from "react-hook-form";

export type V2FieldError = FieldError | string | React.ReactNode | undefined;

export interface V2ControlledFieldContract<TValue, TElement = HTMLElement> {
  value: TValue;
  onValueChange: (value: TValue) => void;
  onBlur?: () => void;
  name?: string;
  ref?: React.Ref<TElement>;
  error?: V2FieldError;
  disabled?: boolean;
}

export interface V2BoundFieldProps<TValue, TElement = HTMLElement> {
  value: TValue;
  onValueChange: (value: TValue) => void;
  onBlur?: () => void;
  name?: string;
  ref?: React.Ref<TElement>;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
}

export type V2OptionalSelectValue = string | undefined;

export interface V2GroupedOption<TValue extends string = string> {
  label: string;
  options: Array<{
    value: TValue;
    label: string;
    disabled?: boolean;
  }>;
}

export interface V2FlatOption<TValue extends string = string> {
  value: TValue;
  label: string;
  disabled?: boolean;
  groupLabel?: string;
  isGroupFirst?: boolean;
}
