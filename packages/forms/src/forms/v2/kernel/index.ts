import type { V2ControllerProps, V2UseControllerProps } from "./controller-props";
import { resolveV2FieldError } from "./field-adapter";
import {
  normalizeStringValue,
  normalizeOptionalStringValue,
  normalizeNullableValue,
  toRHFEmptyString,
  toOptionalSelectValue,
} from "./normalization";
import type {
  V2BoundFieldProps,
  V2FieldError,
  V2ControlledFieldContract,
  V2OptionalSelectValue,
  V2GroupedOption,
  V2FlatOption,
} from "./types";

export type {
  V2BoundFieldProps,
  V2ControllerProps,
  V2UseControllerProps,
  V2FieldError,
  V2ControlledFieldContract,
  V2OptionalSelectValue,
  V2GroupedOption,
  V2FlatOption,
};
export {
  resolveV2FieldError,
  normalizeStringValue,
  normalizeOptionalStringValue,
  normalizeNullableValue,
  toRHFEmptyString,
  toOptionalSelectValue,
};
