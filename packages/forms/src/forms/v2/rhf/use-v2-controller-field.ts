import { useController, type FieldPath, type FieldValues } from "react-hook-form";

import { toOptionalSelectValue, toRHFEmptyString } from "@workspace/forms/v2/kernel/normalization";
import type { V2UseControllerProps } from "@workspace/forms/v2/kernel/controller-props";
import type { V2ControlledFieldContract } from "@workspace/forms/v2/kernel/types";

export type V2ControllerMode = "string" | "optional-select" | "date" | "raw";

const normalizeForMode = (mode: V2ControllerMode, value: unknown) => {
  if (mode === "string") {
    if (typeof value === "string") return value;
    if (value === undefined || value === null) return "";
    return String(value);
  }

  if (mode === "optional-select") {
    return toOptionalSelectValue(typeof value === "string" ? value : undefined);
  }

  return value;
};

const denormalizeForMode = (mode: V2ControllerMode, value: unknown) => {
  if (mode === "optional-select") {
    return toRHFEmptyString(toOptionalSelectValue(value as string | undefined | null));
  }

  return value;
};

export const useV2ControllerField = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  props: V2UseControllerProps<TFieldValues, TName> & { mode?: V2ControllerMode },
): {
  field: ReturnType<typeof useController<TFieldValues, TName>>["field"];
  fieldState: ReturnType<typeof useController<TFieldValues, TName>>["fieldState"];
  contract: V2ControlledFieldContract<unknown, HTMLElement>;
} => {
  const { mode = "raw", ...controllerProps } = props;
  const { field, fieldState } = useController<TFieldValues, TName>(controllerProps);

  const contract: V2ControlledFieldContract<unknown, HTMLElement> = {
    value: normalizeForMode(mode, field.value),
    onValueChange: (value: unknown) => field.onChange(denormalizeForMode(mode, value)),
    ...(field.onBlur !== undefined ? { onBlur: field.onBlur } : {}),
    ...(field.name !== undefined ? { name: field.name } : {}),
    ...(field.ref !== undefined ? { ref: field.ref } : {}),
    ...(fieldState.error !== undefined ? { error: fieldState.error } : {}),
    ...(props.disabled !== undefined ? { disabled: props.disabled } : {}),
  };

  return {
    field,
    fieldState,
    contract,
  };
};
