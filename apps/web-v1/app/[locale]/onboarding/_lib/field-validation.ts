import { isValidFormattedCrp } from "@workspace/forms/utils/crp";

import { BRAZILIAN_STATES } from "./types";

export const CPF_DIGITS = 11;
export const BIRTH_DATE_MIN_AGE = 18;
export const BIRTH_DATE_MAX_AGE = 100;

const CPF_INVALID_REPEATED_DIGITS = /^(\d)\1{10}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALID_CRP_STATES = new Set(BRAZILIAN_STATES.map((state) => state.value));

export const toDigits = (value: string): string => value.replace(/\D/g, "");
export const isIsoDateValue = (value: string): boolean => ISO_DATE_PATTERN.test(value.trim());

export const isValidCpfValue = (value: string): boolean => {
  const digits = toDigits(value);
  if (digits.length !== CPF_DIGITS) return false;
  if (CPF_INVALID_REPEATED_DIGITS.test(digits)) return false;

  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(digits[index] ?? "0") * (10 - index);
  }

  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[9] ?? "0")) return false;

  sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += Number(digits[index] ?? "0") * (11 - index);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === Number(digits[10] ?? "0");
};

export const isValidCrpValue = (value: string): boolean => {
  return isValidFormattedCrp(value);
};

export const isValidCrpStateValue = (value: string): boolean => {
  return VALID_CRP_STATES.has(value.trim());
};

const getBirthDateAge = (value: string): number | null => {
  const normalizedValue = value.trim();
  if (!isIsoDateValue(normalizedValue)) return null;

  const [yearStr, monthStr, dayStr] = normalizedValue.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const birthDate = new Date(Date.UTC(year, month - 1, day));
  const isValidDate =
    birthDate.getUTCFullYear() === year &&
    birthDate.getUTCMonth() === month - 1 &&
    birthDate.getUTCDate() === day;

  if (!isValidDate) {
    return null;
  }

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();
  const currentDay = now.getUTCDate();

  let age = currentYear - year;
  const hasHadBirthdayThisYear =
    currentMonth > month - 1 || (currentMonth === month - 1 && currentDay >= day);
  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age;
};

export const isValidBirthDateValue = (value: string): boolean => {
  const age = getBirthDateAge(value);
  if (age === null) return false;
  return age >= BIRTH_DATE_MIN_AGE && age <= BIRTH_DATE_MAX_AGE;
};
