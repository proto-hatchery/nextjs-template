import type * as React from "react";

import {
  normalizeOptionalStringValue,
  normalizeStringValue,
  toOptionalSelectValue,
  toRHFEmptyString,
} from "./normalization";
import type { V2ControlledFieldContract, V2FieldError } from "./types";

const getErrorMessage = (error: V2FieldError): React.ReactNode | undefined => {
  if (!error) {
    return undefined;
  }

  if (typeof error === "string") {
    return error;
  }

  // Handle array of errors (Zod 4 issues format)
  if (Array.isArray(error)) {
    const firstError = error[0];
    if (firstError && typeof firstError === "object" && "message" in firstError) {
      return String(firstError.message);
    }
    return undefined;
  }

  if (typeof error === "object") {
    // Zod 4 error format with message property
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }

    // Handle Zod 4 raw error issues (fallback)
    if ("issues" in error && Array.isArray((error as { issues?: unknown[] }).issues)) {
      const issues = (error as { issues: Array<{ message?: string }> }).issues;
      const firstIssue = issues[0];
      if (firstIssue && "message" in firstIssue) {
        return firstIssue.message;
      }
    }

    return undefined;
  }

  return error;
};

const asV2InputField = (
  field: V2ControlledFieldContract<unknown, HTMLInputElement>,
): V2ControlledFieldContract<string, HTMLInputElement> => ({
  ...field,
  value: normalizeStringValue(field.value),
  onValueChange: (value) => field.onValueChange(value),
  error: getErrorMessage(field.error),
});

const asV2OptionalSelectField = (
  field: V2ControlledFieldContract<unknown, HTMLElement>,
): V2ControlledFieldContract<string | undefined, HTMLElement> => ({
  ...field,
  value: normalizeOptionalStringValue(field.value),
  onValueChange: (value) => field.onValueChange(toOptionalSelectValue(value)),
  error: getErrorMessage(field.error),
});

const asV2RHFOptionalSelectField = (
  field: V2ControlledFieldContract<unknown, HTMLElement>,
): V2ControlledFieldContract<string, HTMLElement> => ({
  ...field,
  value: toRHFEmptyString(normalizeOptionalStringValue(field.value)),
  onValueChange: (value) => field.onValueChange(toRHFEmptyString(value)),
  error: getErrorMessage(field.error),
});

export const resolveV2FieldError = getErrorMessage;

export { asV2InputField, asV2OptionalSelectField, asV2RHFOptionalSelectField };
