import { z } from "zod";

const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const displayDatePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function isValidDateParts(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function normalizeDateOnlyInput(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = isoDatePattern.exec(trimmed);
  if (isoMatch) {
    const [, yearRaw, monthRaw, dayRaw] = isoMatch;
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);

    return isValidDateParts(year, month, day) ? trimmed : null;
  }

  const displayMatch = displayDatePattern.exec(trimmed);
  if (displayMatch) {
    const [, dayRaw, monthRaw, yearRaw] = displayMatch;
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);

    if (!isValidDateParts(year, month, day)) {
      return null;
    }

    return `${yearRaw}-${monthRaw}-${dayRaw}`;
  }

  return null;
}

export function normalizeOptionalDateOnlyInput(value: string | null | undefined): {
  isValid: boolean;
  value: string | null | undefined;
} {
  if (value === undefined) {
    return { isValid: true, value: undefined };
  }

  if (value === null) {
    return { isValid: true, value: null };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: true, value: null };
  }

  const normalized = normalizeDateOnlyInput(trimmed);
  if (!normalized) {
    return { isValid: false, value: undefined };
  }

  return { isValid: true, value: normalized };
}

export const dateOnlyInputSchema = z
  .string()
  .trim()
  .refine((value) => !!normalizeDateOnlyInput(value), {
    message: "Data inválida. Use o formato DD/MM/AAAA ou YYYY-MM-DD.",
  });
