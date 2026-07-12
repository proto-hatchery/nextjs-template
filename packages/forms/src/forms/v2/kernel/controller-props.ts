import type {
  Control,
  FieldPath,
  FieldPathValue,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";

export interface V2ControllerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  disabled?: boolean;
  defaultValue?: FieldPathValue<TFieldValues, TName>;
}

export type V2UseControllerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<UseControllerProps<TFieldValues, TName>, "control" | "name"> &
  V2ControllerProps<TFieldValues, TName>;
