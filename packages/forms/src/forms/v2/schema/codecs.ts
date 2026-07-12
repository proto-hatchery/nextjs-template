import { z } from "zod";

import {
  currencyDisplaySchema,
  dateOrUndefinedSchema,
  e164OrUndefinedSchema,
  maskedDateStringSchema,
  numberOrUndefinedSchema,
  optionalSelectIdInputSchema,
  optionalSelectIdSchema,
  phoneDisplaySchema,
} from "./primitives";
import { normalizeOptionalStringValue, toRHFEmptyString } from "@workspace/forms/v2/kernel";

const toDateFromMasked = (value: string): Date | undefined => {
  if (!value) return undefined;

  const [dayRaw, monthRaw, yearRaw] = value.split("/");
  const day = Number(dayRaw);
  const month = Number(monthRaw);
  const year = Number(yearRaw);

  if (!day || !month || !year) return undefined;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return undefined;

  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return undefined;
  }

  return date;
};

const toMaskedDate = (value: Date | undefined): string => {
  if (!value) return "";

  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = String(value.getFullYear());
  return `${day}/${month}/${year}`;
};

const parseCurrency = (value: string): number | undefined => {
  if (!value) return undefined;

  const numeric = Number(
    value
      .replace(/[^\d,-]/g, "")
      .replace(/\./g, "")
      .replace(",", "."),
  );
  if (Number.isNaN(numeric)) {
    return undefined;
  }

  return numeric;
};

const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || Number.isNaN(value)) {
    return "";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const normalizePhoneDecode = (value: string): string | undefined => {
  if (!value) return undefined;

  if (value.startsWith("+")) {
    return value;
  }

  const digits = value.replace(/\D/g, "");
  if (!digits) return undefined;

  return `+${digits}`;
};

const formatPhoneDisplay = (value: string | undefined): string => {
  if (!value) return "";
  return value;
};

export const dateMaskedCodec = z.codec(maskedDateStringSchema, dateOrUndefinedSchema, {
  decode: toDateFromMasked,
  encode: toMaskedDate,
});

export const currencyCodec = z.codec(currencyDisplaySchema, numberOrUndefinedSchema, {
  decode: parseCurrency,
  encode: formatCurrency,
});

export const phoneCodec = z.codec(phoneDisplaySchema, e164OrUndefinedSchema, {
  decode: normalizePhoneDecode,
  encode: formatPhoneDisplay,
});

export const optionalSelectIdCodec = z.codec(optionalSelectIdInputSchema, optionalSelectIdSchema, {
  decode: (value) => (value ? value : undefined),
  encode: (value) => value ?? "",
});

export const createRequiredSelectIdCodec = (message: string) =>
  z.codec(optionalSelectIdInputSchema, z.string().min(1, message), {
    decode: (value) => normalizeOptionalStringValue(value) ?? "",
    encode: (value) => toRHFEmptyString(value),
  });

export const v2Codecs = {
  dateMaskedCodec,
  currencyCodec,
  phoneCodec,
  optionalSelectIdCodec,
  createRequiredSelectIdCodec,
};
