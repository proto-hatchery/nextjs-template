/**
 * Formatting utilities for form fields
 * Consolidates all formatting functions from various field components
 */

import { CRP_MASK_PLACEHOLDER, formatCrp as formatCrpValue } from "./crp";

export const BRAZILIAN_CPF_MASK = "999.999.999-99";

export const formatCpf = (value: string | undefined): string => {
  const digitsOnly = (value ?? "").replace(/\D/g, "").slice(0, 11);

  if (digitsOnly.length <= 3) {
    return digitsOnly;
  }

  if (digitsOnly.length <= 6) {
    return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3)}`;
  }

  if (digitsOnly.length <= 9) {
    return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6)}`;
  }

  return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6, 9)}-${digitsOnly.slice(9, 11)}`;
};

export const cleanCpf = (value: string | undefined): string => {
  return (value ?? "").replace(/\D/g, "");
};

export const BRAZILIAN_CNPJ_MASK = "99.999.999/9999-99";

export const formatCnpj = (value: string | undefined): string => {
  const digitsOnly = (value ?? "").replace(/\D/g, "").slice(0, 14);

  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }

  if (digitsOnly.length <= 5) {
    return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2)}`;
  }

  if (digitsOnly.length <= 8) {
    return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 5)}.${digitsOnly.slice(5)}`;
  }

  if (digitsOnly.length <= 12) {
    return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 5)}.${digitsOnly.slice(5, 8)}/${digitsOnly.slice(8)}`;
  }

  return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 5)}.${digitsOnly.slice(5, 8)}/${digitsOnly.slice(8, 12)}-${digitsOnly.slice(12, 14)}`;
};

export const cleanCnpj = (value: string | undefined): string => {
  return (value ?? "").replace(/\D/g, "");
};

const RG_MAX_LENGTH = 9;

export const BRAZILIAN_RG_MASK = "99.999.999-X";

export const formatRg = (value: string): string => {
  const normalized = value
    .replace(/[^0-9xX]/g, "")
    .toUpperCase()
    .slice(0, RG_MAX_LENGTH);
  const digits = normalized.slice(0, 8);
  const checkDigit = normalized.slice(8, 9);

  if (!digits) return normalized;

  let formatted = digits;

  if (digits.length > 2 && digits.length <= 5) {
    formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`;
  } else if (digits.length > 5) {
    formatted = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }

  return checkDigit ? `${formatted}-${checkDigit}` : formatted;
};

export const cleanRg = (value: string): string => value.replace(/[^0-9xX]/g, "").toUpperCase();

// ============================================================================
// CRP Formatting
// ============================================================================

export const BRAZILIAN_CRP_MASK = CRP_MASK_PLACEHOLDER;

export const formatCrp = (value: string): string => formatCrpValue(value);

export const getCrpRegion = (crp: string): number | null => {
  const digitsOnly = crp.replace(/\D/g, "");

  if (digitsOnly.length >= 2) {
    const region = Number.parseInt(digitsOnly.slice(0, 2), 10);
    return Number.isNaN(region) ? null : region;
  }

  return null;
};

// ============================================================================
// ZIP Code Formatting
// ============================================================================

export const BRAZILIAN_ZIP_CODE_MASK = "99999-999";

export const formatZipCode = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, "");

  if (digitsOnly.length <= 5) {
    return digitsOnly;
  }

  return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 8)}`;
};

// ============================================================================
// Currency Formatting
// ============================================================================

export const BRAZILIAN_CURRENCY_MASK = "R$ 999.999.999,99";

export const formatCurrency = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return "R$ 0,00";
  }

  const numberValue = Number.parseInt(digitsOnly, 10);

  const reais = numberValue / 100;

  return reais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatCurrencyInput = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  const numberValue = Number.parseInt(digitsOnly, 10);

  const reais = numberValue / 100;

  return reais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const currencyToNumber = (value: string): number => {
  const cleanValue = value.replace(/[^\d,]/g, "");

  const normalizedValue = cleanValue.replace(",", ".");

  const numberValue = Number.parseFloat(normalizedValue);

  return Number.isNaN(numberValue) ? 0 : numberValue;
};

export const numberToCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return (0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const cleanCurrencyValue = (value: string): string => {
  return value.replace(/\D/g, "");
};

export const applyCurrencyMask = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  const numberValue = Number.parseInt(digitsOnly, 10);

  const valueInReais = numberValue / 100;

  return valueInReais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// ============================================================================
// Birthdate Formatting
// ============================================================================

export const formatBirthdate = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 8);

  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }

  if (digitsOnly.length <= 4) {
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  }

  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
};

export const cleanBirthdate = (value: string): string => {
  return value.replace(/\D/g, "");
};

export const parseBirthdate = (value: string): Date | null => {
  const digitsOnly = cleanBirthdate(value);

  if (digitsOnly.length !== 8) {
    return null;
  }

  const day = Number.parseInt(digitsOnly.slice(0, 2), 10);
  const month = Number.parseInt(digitsOnly.slice(2, 4), 10) - 1;
  const year = Number.parseInt(digitsOnly.slice(4, 8), 10);

  if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
    return null;
  }

  const date = new Date(year, month, day);

  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null;
  }

  return date;
};

export const formatDateToString = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const isNotFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate <= today;
};
