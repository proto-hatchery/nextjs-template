import type * as React from "react";

import {
  asV2InputField,
  asV2OptionalSelectField,
  asV2RHFOptionalSelectField,
  resolveV2FieldError,
} from "@workspace/forms/v2/kernel/field-adapter";
import { toOptionalSelectValue } from "@workspace/forms/v2/kernel/normalization";
import type {
  V2BoundFieldProps,
  V2ControlledFieldContract,
  V2FieldError,
  V2FlatOption,
  V2GroupedOption,
} from "@workspace/forms/v2/kernel/types";

type V2FieldMeta<TElement extends HTMLElement> = {
  name?: string;
  onBlur?: () => void;
  ref?: React.Ref<TElement>;
  error?: V2FieldError;
  disabled?: boolean;
};

type V2RefMapper<TSourceElement extends HTMLElement, TTargetElement extends HTMLElement> = (
  ref: React.Ref<TSourceElement>,
) => React.Ref<TTargetElement>;

const withBoundFieldMeta = <
  TValue,
  TSourceElement extends HTMLElement,
  TTargetElement extends HTMLElement,
>(
  field: V2FieldMeta<TSourceElement>,
  value: TValue,
  onValueChange: (value: TValue) => void,
  refMapper?: V2RefMapper<TSourceElement, TTargetElement>,
): V2BoundFieldProps<TValue, TTargetElement> => {
  const props: V2BoundFieldProps<TValue, TTargetElement> = {
    value,
    onValueChange,
  };

  if (field.name !== undefined) {
    props.name = field.name;
  }
  if (field.onBlur !== undefined) {
    props.onBlur = field.onBlur;
  }
  if (field.ref !== undefined && refMapper !== undefined) {
    props.ref = refMapper(field.ref);
  }

  const errorMessage = resolveV2FieldError(field.error);
  if (errorMessage !== undefined) {
    props.errorMessage = errorMessage;
  }
  if (field.disabled !== undefined) {
    props.disabled = field.disabled;
  }

  return props;
};

const asInputRef: V2RefMapper<HTMLInputElement, HTMLInputElement> = (ref) =>
  ref as React.Ref<HTMLInputElement>;
const asTextareaRef: V2RefMapper<HTMLInputElement, HTMLTextAreaElement> = (ref) =>
  ref as React.Ref<HTMLTextAreaElement>;
const asButtonRef: V2RefMapper<HTMLElement, HTMLButtonElement> = (ref) =>
  ref as React.Ref<HTMLButtonElement>;
const asInputLikeRef: V2RefMapper<HTMLElement, HTMLInputElement> = (ref) =>
  ref as React.Ref<HTMLInputElement>;

export type V2InputFieldBinding = V2BoundFieldProps<string, HTMLInputElement>;
export type V2TextareaFieldBinding = V2BoundFieldProps<string, HTMLTextAreaElement>;
export type V2SelectFieldBinding = V2BoundFieldProps<string | undefined, HTMLButtonElement>;
export type V2SearchSelectFieldBinding = V2BoundFieldProps<string | undefined, HTMLButtonElement>;
export type V2PatientFieldBinding = V2BoundFieldProps<string, HTMLInputElement>;
export type V2DateFieldBinding = V2BoundFieldProps<string, HTMLInputElement>;

export const getV2InputProps = (
  field: V2ControlledFieldContract<unknown, HTMLElement>,
): V2InputFieldBinding => {
  const adapted = asV2InputField(field as V2ControlledFieldContract<unknown, HTMLInputElement>);
  return withBoundFieldMeta(adapted, adapted.value, adapted.onValueChange, asInputRef);
};

export const getV2TextareaProps = (
  field: V2ControlledFieldContract<unknown, HTMLElement>,
): V2TextareaFieldBinding => {
  const adapted = asV2InputField(field as V2ControlledFieldContract<unknown, HTMLInputElement>);
  return withBoundFieldMeta(adapted, adapted.value, adapted.onValueChange, asTextareaRef);
};

export const getV2SelectProps = (
  field: V2ControlledFieldContract<unknown, HTMLElement>,
): V2SelectFieldBinding => {
  const adapted = asV2OptionalSelectField(field);
  return withBoundFieldMeta(adapted, adapted.value, adapted.onValueChange, asButtonRef);
};

export interface V2RadioGroupFieldBinding {
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  onBlur?: () => void;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
}

export const getV2RadioGroupProps = (
  field: V2ControlledFieldContract<unknown, HTMLElement>,
): V2RadioGroupFieldBinding => {
  const adapted = asV2OptionalSelectField(field);
  const errorMessage = resolveV2FieldError(adapted.error);

  const props: V2RadioGroupFieldBinding = {
    value: adapted.value,
    onValueChange: adapted.onValueChange,
  };

  if (adapted.onBlur !== undefined) {
    props.onBlur = adapted.onBlur;
  }
  if (errorMessage !== undefined) {
    props.errorMessage = errorMessage;
  }
  if (adapted.disabled !== undefined) {
    props.disabled = adapted.disabled;
  }

  return props;
};

export const flattenGroupedOptions = (groups: V2GroupedOption[]): V2FlatOption[] => {
  return groups.flatMap((group) =>
    group.options.map((option, index) => ({
      ...option,
      groupLabel: group.label,
      isGroupFirst: index === 0,
    })),
  );
};

export const getV2SearchSelectProps = (
  field: V2ControlledFieldContract<unknown, HTMLElement>,
): V2SearchSelectFieldBinding => {
  const adapted = asV2OptionalSelectField(field);
  return withBoundFieldMeta(adapted, adapted.value, adapted.onValueChange, asButtonRef);
};

export const getV2PatientProps = (
  field: V2ControlledFieldContract<unknown, HTMLElement>,
): V2PatientFieldBinding => {
  const adapted = asV2RHFOptionalSelectField(field);
  return withBoundFieldMeta(adapted, adapted.value, adapted.onValueChange, asInputLikeRef);
};

export const getV2DateProps = (
  field: V2ControlledFieldContract<unknown, HTMLElement>,
): V2DateFieldBinding => {
  const adapted = asV2InputField(field as V2ControlledFieldContract<unknown, HTMLInputElement>);
  return withBoundFieldMeta(adapted, adapted.value, adapted.onValueChange, asInputRef);
};

export const toOptionalSearchValue = (value: string | undefined) => toOptionalSelectValue(value);

export type V2InputProps = V2InputFieldBinding;
export type V2TextareaProps = V2TextareaFieldBinding;
export type V2SelectProps = V2SelectFieldBinding;
export type V2SearchSelectProps = V2SearchSelectFieldBinding;
export type V2PatientProps = V2PatientFieldBinding;
export type V2DateProps = V2DateFieldBinding;
export type V2RadioGroupProps = V2RadioGroupFieldBinding;
