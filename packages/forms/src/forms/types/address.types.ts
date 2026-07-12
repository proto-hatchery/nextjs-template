export interface AddressData {
  street: string;
  number: string;
  complement?: string | undefined;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string | undefined;
}

export interface UseViaCepReturn {
  data: AddressData | null;
  loading: boolean;
  error: string | null;
  fetchAddress: (cep: string) => Promise<void>;
  clearAddress: () => void;
}

export interface CepFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "size" | "onError"
> {
  ref?: React.Ref<HTMLInputElement>;
  value?: string;
  onChange?: (value: string) => void;
  onAddressFound?: (address: AddressData) => void;
  onError?: (error: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  helperText?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost";
  containerClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  errorMessageClassName?: string;
}

export interface AddressFieldsProps {
  ref?: React.Ref<HTMLDivElement>;
  value?: AddressData;
  onChange?: (address: AddressData) => void;
  disableUntilCepFound?: boolean;
  cepLabel?: string;
  streetLabel?: string;
  numberLabel?: string;
  complementLabel?: string;
  neighborhoodLabel?: string;
  cityLabel?: string;
  stateLabel?: string;
  errors?: Partial<Record<keyof AddressData, string>>;
  size?: "sm" | "md" | "lg";
}
