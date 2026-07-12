/**
 * Type definitions for form fields
 * Consolidates all type definitions from various field components
 */

import type {
  TextFieldProps,
  TextFieldSize,
  TextFieldVariant,
} from "@workspace/forms/components/base/text-field.component";
import type * as RPNInput from "react-phone-number-input";
import type {
  PhoneDisplayFormat,
  PhoneValueChangeDetails,
  PhoneValidationError,
} from "@workspace/forms/utils/phone";
import type {
  AddressData,
  AddressFieldsProps,
  CepFieldProps,
  UseViaCepReturn,
} from "./address.types";

// ============================================================================
// Select with Search Types
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectWithSearchProps {
  ref?: React.Ref<HTMLButtonElement>;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  size?: TextFieldSize;
  variant?: TextFieldVariant;
  containerClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  hideLabel?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  autoFocus?: boolean;
  searchDelay?: number;
  value?: string;
  onChange?: (value: string | undefined) => void;
  options?: SelectOption[];
  onSearch?: (value: string) => Promise<SelectOption[] | undefined>;
  searchOnFocus?: boolean;
  groups?: SelectOptionGroup[];
  allowClear?: boolean;
  filterFunction?: (option: SelectOption, searchValue: string) => boolean;
  minSearchLength?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isInvalid?: boolean;
}

// ============================================================================
// Phone Input Types
// ============================================================================

export interface PhoneFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "size"
> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  errorText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  size?: TextFieldSize;
  containerClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  hideLabel?: boolean;
  value?: RPNInput.Value | string;
  onChange?: (value: string | undefined, meta?: PhoneValueChangeDetails) => void;
  onValueChange?: (meta: PhoneValueChangeDetails) => void;
  onValueBlur?: (meta: PhoneValueChangeDetails) => void;
  country?: RPNInput.Country;
  defaultCountry?: RPNInput.Country;
  onCountryChange?: (country: RPNInput.Country) => void;
  international?: boolean;
  countries?: RPNInput.Country[];
  withCountrySelect?: boolean;
  formatOnBlur?: boolean;
  displayFormat?: PhoneDisplayFormat;
  normalizeOnChange?: boolean;
  required?: boolean;
}

export type PhoneInputProps = PhoneFieldProps;
export type { PhoneDisplayFormat, PhoneValidationError, PhoneValueChangeDetails };

// ============================================================================
// OTP Field Types
// ============================================================================

export interface OtpFieldProps {
  ref?: React.Ref<HTMLInputElement>;
  label?: string;
  placeholder?: string;
  maxLength?: number;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  containerClassName?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

export interface OtpFieldSlotProps {
  hasError?: boolean;
  char?: string | null;
  isActive?: boolean;
}

// ============================================================================
// Currency Field Types
// ============================================================================

export interface CurrencyFieldProps extends Omit<TextFieldProps, "type" | "value" | "onChange"> {
  ref?: React.Ref<HTMLInputElement>;
  /** Current value - can be string (formatted) or number */
  value?: string | number;
  /** Callback when value changes - receives both formatted string and numeric value */
  onValueChange?: (formatted: string, numeric: number) => void;
  /** Maximum allowed value (numeric, e.g., 5000.00) */
  maxValue?: number;
  /** Optional onChange for compatibility with form libraries */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// ============================================================================
// ZIP Code Field Types
// ============================================================================

export interface ZipCodeFieldProps extends Omit<TextFieldProps, "type"> {
  displayMode?: boolean;
  customValidation?: (value: string) => boolean;
  onSearch?: () => void;
}

export type ZipCodeInputProps = ZipCodeFieldProps;

export type { AddressData, AddressFieldsProps, CepFieldProps, UseViaCepReturn };

// ============================================================================
// Re-export base field types
// ============================================================================

export type { TextFieldProps, TextFieldSize, TextFieldVariant };
