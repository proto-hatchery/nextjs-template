/**
 * Validation utilities for form fields
 * Consolidates all validation functions from various field components
 */

import { z } from "zod";
import { isValidCrpDigits, isValidFormattedCrp } from "./crp";
import { cleanCpf, cleanCnpj } from "./formatting";

export const isValidCpf = (value: string | undefined): boolean => {
  const digitsOnly = (value ?? "").replace(/\D/g, "");

  if (digitsOnly.length !== 11) return false;

  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(digitsOnly)) return false;

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number.parseInt(digitsOnly.charAt(i), 10) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const firstDigit = remainder < 2 ? 0 : remainder;

  if (Number.parseInt(digitsOnly.charAt(9), 10) !== firstDigit) return false;

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number.parseInt(digitsOnly.charAt(i), 10) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  const secondDigit = remainder < 2 ? 0 : remainder;

  return Number.parseInt(digitsOnly.charAt(10), 10) === secondDigit;
};

export const cpfSchema = (required = true) => {
  let schema = z.string();

  if (required) {
    schema = schema.min(1, "Campo obrigatório");
  }

  return schema
    .refine(
      (value) => {
        if (!value || value.trim() === "") return !required;
        const digits = cleanCpf(value);
        return digits.length === 11;
      },
      {
        message: "CPF incompleto",
      },
    )
    .refine(
      (value) => {
        if (!value || value.trim() === "") return !required;
        const digits = cleanCpf(value);
        return isValidCpf(digits);
      },
      {
        message: "CPF inválido",
      },
    );
};

export const cpfRequiredSchema = cpfSchema(true);
export const cpfOptionalSchema = cpfSchema(false);

export const isValidCnpj = (value: string | undefined): boolean => {
  const digitsOnly = (value ?? "").replace(/\D/g, "");

  if (digitsOnly.length !== 14) return false;

  // Check if all digits are the same
  if (/^(\d)\1{13}$/.test(digitsOnly)) return false;

  // Validate first check digit
  let sum = 0;
  let weight = 2;

  for (let i = 11; i >= 0; i -= 1) {
    sum += Number.parseInt(digitsOnly.charAt(i), 10) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  if (Number.parseInt(digitsOnly.charAt(12), 10) !== firstDigit) return false;

  // Validate second check digit
  sum = 0;
  weight = 2;

  for (let i = 12; i >= 0; i -= 1) {
    sum += Number.parseInt(digitsOnly.charAt(i), 10) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  return Number.parseInt(digitsOnly.charAt(13), 10) === secondDigit;
};

export const cnpjSchema = (required = true) => {
  let schema = z.string();

  if (required) {
    schema = schema.min(1, "Campo obrigatório");
  }

  return schema
    .refine(
      (value) => {
        if (!value || value.trim() === "") return !required;
        const digits = cleanCnpj(value);
        return digits.length === 14;
      },
      {
        message: "CNPJ incompleto",
      },
    )
    .refine(
      (value) => {
        if (!value || value.trim() === "") return !required;
        const digits = cleanCnpj(value);
        return isValidCnpj(digits);
      },
      {
        message: "CNPJ inválido",
      },
    );
};

export const cnpjRequiredSchema = cnpjSchema(true);
export const cnpjOptionalSchema = cnpjSchema(false);

// ============================================================================
// RG Validation
// ============================================================================

const RG_MAX_LENGTH = 9;

export const isValidRg = (value: string): boolean => {
  const normalized = value.replace(/[^0-9xX]/g, "").toUpperCase();

  if (normalized.length !== RG_MAX_LENGTH) return false;

  const numbers = normalized.slice(0, 8);
  const checkChar = normalized[8];

  if (/^(\d)\1{7}$/.test(numbers)) return false;

  const weights = [2, 3, 4, 5, 6, 7, 8, 9];
  const sum = numbers
    .split("")
    .reduce((acc, digit, index) => acc + Number.parseInt(digit, 10) * (weights[index] || 0), 0);
  const remainder = sum % 11;
  let expected = 11 - remainder;

  if (expected === 10) {
    return checkChar === "X";
  }
  if (expected === 11) {
    expected = 0;
  }

  return checkChar === expected.toString();
};

// ============================================================================
// CRP Validation
// ============================================================================

export const isValidCrp = (value: string): boolean => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return false;

  if (trimmedValue.includes("/") || trimmedValue.includes("-")) {
    return isValidFormattedCrp(trimmedValue);
  }

  return isValidCrpDigits(trimmedValue);
};

// ============================================================================
// ZIP Code Validation
// ============================================================================

export const isValidZipCode = (value: string): boolean => {
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.length === 8;
};

// ============================================================================
// Currency Validation
// ============================================================================

export const isValidCurrency = (value: string): boolean => {
  const cleanValue = value.replace(/[^\d,]/g, "");
  const normalizedValue = cleanValue.replace(",", ".");
  const numericValue = Number.parseFloat(normalizedValue);

  if (Number.isNaN(numericValue)) return false;

  return numericValue >= 0 && numericValue <= 999999999.99;
};

// ============================================================================
// Password Validation
// ============================================================================

export interface PasswordRequirement {
  id: string;
  met: boolean;
  text: string;
}

const PASSWORD_REQUIREMENT_RULES: ReadonlyArray<{
  id: string;
  regex: RegExp;
  text: string;
}> = [
  { id: "min-length", regex: /.{8,}/, text: "Pelo menos 8 caracteres" },
  { id: "number", regex: /[0-9]/, text: "Pelo menos 1 número" },
  { id: "lowercase", regex: /[a-z]/, text: "Pelo menos 1 letra minúscula" },
  { id: "uppercase", regex: /[A-Z]/, text: "Pelo menos 1 letra maiúscula" },
  {
    id: "special",
    regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/,
    text: "Pelo menos 1 caractere especial",
  },
];

export const checkPasswordStrength = (password: string): PasswordRequirement[] =>
  PASSWORD_REQUIREMENT_RULES.map((rule) => ({
    id: rule.id,
    met: rule.regex.test(password),
    text: rule.text,
  }));

export const calculateStrengthScore = (requirements: PasswordRequirement[]): number => {
  return requirements.filter((req) => req.met).length;
};

export const getStrengthColor = (score: number): string => {
  if (score === 0) return "bg-border";
  if (score <= 1) return "bg-strength-weak";
  if (score <= 2) return "bg-strength-fair";
  if (score <= 3) return "bg-strength-good";
  if (score === 4) return "bg-strength-strong";
  return "bg-strength-excellent";
};

export const getStrengthText = (score: number): string => {
  if (score === 0) return "Digite uma senha";
  if (score <= 2) return "Senha fraca";
  if (score === 3) return "Senha média";
  if (score === 4) return "Senha boa";
  return "Senha muito forte";
};

// ============================================================================
// Birthdate Validation
// ============================================================================

export const birthdateSchema = (required = true, minAge?: number) => {
  let schema = z.string();

  if (required) {
    schema = schema.min(1, "Campo obrigatório");
  }

  schema = schema
    .refine(
      (value) => {
        if (!value || value.trim() === "") return !required;
        const digitsOnly = value.replace(/\D/g, "");
        return digitsOnly.length === 8;
      },
      {
        message: "Data incompleta",
      },
    )
    .refine(
      (value) => {
        if (!value || value.trim() === "") return !required;
        const day = Number.parseInt(value.slice(0, 2), 10);
        const month = Number.parseInt(value.slice(3, 5), 10) - 1;
        const year = Number.parseInt(value.slice(6, 10), 10);

        if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
          return false;
        }

        const date = new Date(year, month, day);
        return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
      },
      {
        message: "Data inválida",
      },
    )
    .refine(
      (value) => {
        if (!value || value.trim() === "") return !required;
        const day = Number.parseInt(value.slice(0, 2), 10);
        const month = Number.parseInt(value.slice(3, 5), 10) - 1;
        const year = Number.parseInt(value.slice(6, 10), 10);
        const date = new Date(year, month, day);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date <= today;
      },
      {
        message: "A data não pode ser futura",
      },
    );

  if (minAge !== undefined) {
    schema = schema.refine(
      (value) => {
        if (!value || value.trim() === "") return !required;
        const day = Number.parseInt(value.slice(0, 2), 10);
        const month = Number.parseInt(value.slice(3, 5), 10) - 1;
        const year = Number.parseInt(value.slice(6, 10), 10);
        const date = new Date(year, month, day);

        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
          age -= 1;
        }

        return age >= minAge;
      },
      {
        message: `Idade mínima de ${minAge} anos`,
      },
    );
  }

  return schema;
};

export const birthdateRequiredSchema = birthdateSchema(true);
export const birthdateOptionalSchema = birthdateSchema(false);
export const birthdateWithMinAgeSchema = (minAge: number, required = true) => {
  return birthdateSchema(required, minAge);
};
