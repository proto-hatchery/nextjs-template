import {
  type CountryCode,
  type E164Number,
  type ValidatePhoneNumberLengthResult,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
} from "libphonenumber-js";

export type PhoneDisplayFormat = "international" | "national" | "raw";

export type PhoneValidationError =
  | "TOO_SHORT"
  | "TOO_LONG"
  | "INVALID_COUNTRY"
  | "NOT_A_NUMBER"
  | "INVALID_LENGTH"
  | "INVALID_NUMBER";

export interface PhoneParseResult {
  raw: string;
  cleaned: string;
  country?: CountryCode;
  e164?: E164Number;
  national?: string;
  international?: string;
  isPossible: boolean;
  isValid: boolean;
  error?: PhoneValidationError;
}

export interface PhoneValueChangeDetails extends PhoneParseResult {
  rawValue: string;
  formattedValue: string;
}

/**
 * Formats a Brazilian phone number as the user types.
 * Handles both mobile (11 digits) and landline (10 digits) formats.
 *
 * Output format:
 * - 2 digits: "11"
 * - 3-6 digits: "(11) 9"
 * - 7-10 digits (landline): "(11) 1234-5678"
 * - 7-11 digits (mobile): "(11) 91234-5678"
 */
export const formatBrazilianPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");

  const limited = digits.slice(0, 11);

  if (limited.length === 0) {
    return "";
  }

  if (limited.length <= 2) {
    return limited.length === 1 ? `(${limited}` : `(${limited})`;
  }

  const areaCode = limited.slice(0, 2);
  const rest = limited.slice(2);

  if (rest.length <= 4) {
    return `(${areaCode}) ${rest}`;
  }

  if (rest.length <= 8) {
    if (rest.length === 8 && !rest.startsWith("9")) {
      return `(${areaCode}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    }
    if (rest.length <= 5) {
      return `(${areaCode}) ${rest}`;
    }
    return `(${areaCode}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  }

  return `(${areaCode}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
};

/**
 * Formats a US phone number as the user types.
 *
 * Output format:
 * - 3 digits: "(XXX"
 * - 4-6 digits: "(XXX) XXX"
 * - 7-10 digits: "(XXX) XXX-XXXX"
 */
export const formatUSPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  const limited = digits.slice(0, 10);

  if (limited.length === 0) return "";

  if (limited.length <= 3) {
    return `(${limited}`;
  }

  if (limited.length <= 6) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  }

  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
};

/**
 * Formats a Portugal phone number as the user types.
 *
 * Output format:
 * - 3 digits: "XXX"
 * - 4-6 digits: "XXX XXX"
 * - 7-9 digits: "XXX XXX XXX"
 */
export const formatPortugalPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  const limited = digits.slice(0, 9);

  if (limited.length === 0) return "";

  if (limited.length <= 3) {
    return limited;
  }

  if (limited.length <= 6) {
    return `${limited.slice(0, 3)} ${limited.slice(3)}`;
  }

  return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
};

export const normalizePhoneInput = (value?: string | null): string => {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  const hasLeadingPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");

  if (!digitsOnly) {
    return hasLeadingPlus ? "+" : "";
  }

  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
};

export const parsePhoneValue = (value?: string | null, country?: CountryCode): PhoneParseResult => {
  const raw = value ?? "";
  const cleaned = normalizePhoneInput(raw);
  const hasValue = cleaned.length > 0;

  let parsed = hasValue ? parsePhoneNumberFromString(cleaned, country) : undefined;

  if (!parsed && hasValue && !cleaned.startsWith("+") && country) {
    parsed = parsePhoneNumberFromString(`+${cleaned}`, country);
  }

  const e164 = parsed?.number as E164Number | undefined;
  const national = parsed?.formatNational?.();
  const international = parsed?.formatInternational?.();
  const derivedCountry = parsed?.country ?? country;

  const isPossible =
    parsed?.isPossible?.() ?? (hasValue ? isPossiblePhoneNumber(cleaned, country) : false);
  const isValid = parsed?.isValid?.() ?? (hasValue ? isValidPhoneNumber(cleaned, country) : false);

  let error: PhoneValidationError | undefined;
  if (!hasValue) {
    error = raw ? "NOT_A_NUMBER" : undefined;
  } else if (!isPossible) {
    const lengthReason = validatePhoneNumberLength(cleaned, country);
    if (isPhoneLengthError(lengthReason)) {
      error = lengthReason;
    } else {
      error = "INVALID_NUMBER";
    }
  } else if (!isValid) {
    error = "INVALID_NUMBER";
  }

  return {
    raw,
    cleaned,
    ...(derivedCountry !== undefined ? { country: derivedCountry } : {}),
    ...(e164 !== undefined ? { e164 } : {}),
    ...(national !== undefined ? { national } : {}),
    ...(international !== undefined ? { international } : {}),
    isPossible: Boolean(isPossible),
    isValid: Boolean(isValid && e164),
    ...(error !== undefined ? { error } : {}),
  };
};

export const formatPhoneDisplay = (
  value?: string | null,
  options?: { country?: CountryCode; format?: PhoneDisplayFormat },
): string => {
  const format = options?.format ?? "raw";
  if (format === "raw") return value ?? "";

  const parsed = parsePhoneValue(value, options?.country);
  if (!parsed.cleaned) return value ?? "";

  if (format === "international") {
    return parsed.international ?? parsed.e164 ?? parsed.cleaned;
  }

  return parsed.national ?? parsed.international ?? parsed.e164 ?? parsed.cleaned;
};

export const getPhoneErrorMessage = (
  error?: PhoneValidationError,
  countryName?: string,
): string | undefined => {
  switch (error) {
    case "TOO_SHORT":
      return countryName
        ? `Este número parece curto demais para ${countryName}.`
        : "Este número parece curto demais para o país selecionado.";
    case "TOO_LONG":
      return countryName
        ? `Este número parece longo demais para ${countryName}.`
        : "Este número parece longo demais para o país selecionado.";
    case "INVALID_COUNTRY":
      return "País inválido para este número.";
    case "INVALID_LENGTH":
    case "INVALID_NUMBER":
      return "Não conseguimos reconhecer este telefone. Verifique o código do país e os dígitos.";
    case "NOT_A_NUMBER":
      return "Insira apenas números e o símbolo de + quando necessário.";
    default:
      return undefined;
  }
};

export const deriveCountryFromNumber = (
  value?: string | null,
  fallback?: CountryCode,
): CountryCode | undefined => {
  const parsed = parsePhoneValue(value, fallback);
  return parsed.country ?? fallback;
};

export const buildPhoneChangeDetails = (
  rawValue: string,
  country?: CountryCode,
  format: PhoneDisplayFormat = "international",
): PhoneValueChangeDetails => {
  const parsed = parsePhoneValue(rawValue, country);

  return {
    ...parsed,
    rawValue,
    formattedValue: formatPhoneDisplay(rawValue, {
      ...(country !== undefined ? { country } : {}),
      format,
    }),
  };
};

const isPhoneLengthError = (
  result?: ValidatePhoneNumberLengthResult,
): result is Extract<PhoneValidationError, ValidatePhoneNumberLengthResult> => {
  return (
    result === "INVALID_COUNTRY" ||
    result === "INVALID_LENGTH" ||
    result === "NOT_A_NUMBER" ||
    result === "TOO_LONG" ||
    result === "TOO_SHORT"
  );
};
