"use client";

import {
  FluriFieldV2Select,
  type FluriFieldV2SelectOption as SelectOption,
  type FluriFieldV2SelectProps as FloatingLabelSelectProps,
  type FluriFieldV2SelectSize as FloatingLabelSelectSize,
} from "./v2/fluri-field-v2-select.component";

const FloatingLabelSelect = FluriFieldV2Select;

export { FloatingLabelSelect };
export type { FloatingLabelSelectProps, FloatingLabelSelectSize, SelectOption };
export default FloatingLabelSelect;
