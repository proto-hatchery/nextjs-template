import { normalizeOptionalStringValue } from "@workspace/forms/v2/kernel";
import { z } from "zod";

export const optionalSelectWithNoneCodec = z.codec(
  z.union([z.string(), z.undefined()]),
  z.string().optional(),
  {
    decode: (value) => {
      const normalized = normalizeOptionalStringValue(value);
      if (!normalized || normalized === "none") {
        return undefined;
      }
      return normalized;
    },
    encode: (value) => value ?? "none",
  },
);

export const optionalNotesCodec = z.codec(
  z.union([z.string(), z.undefined()]),
  z.string().optional(),
  {
    decode: (value) => {
      if (value === undefined) return undefined;
      return normalizeOptionalStringValue(String(value).trim());
    },
    encode: (value) => value ?? "",
  },
);

export const dateCodec = z.codec(z.string(), z.string().optional(), {
  decode: (value) => {
    const normalized = normalizeOptionalStringValue(value);
    if (!normalized) return undefined;
    if (normalized.includes("T")) return normalized.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(normalized);
    if (!match) return undefined;
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  },
  encode: (value) => {
    if (!value) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (isoDateMatch) {
      const [, year, month, day] = isoDateMatch;
      return `${day}/${month}/${year}`;
    }
    if (value.includes("T")) {
      const datePart = value.slice(0, 10);
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
      if (match) {
        const [, year, month, day] = match;
        return `${day}/${month}/${year}`;
      }
    }
    return "";
  },
});

const parseAmountFromDisplay = (value: string): number => {
  const normalized = value
    .replace(/[^\d,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatAmountToDisplay = (value: number): string => {
  if (!value || value <= 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
};

export const amountCodec = z.codec(
  z.union([z.string(), z.number()]),
  z.number().positive("Informe um valor maior que zero"),
  {
    decode: (value) => {
      if (typeof value === "number") return value;
      return parseAmountFromDisplay(value);
    },
    encode: formatAmountToDisplay,
  },
);

export const parseAmountBRL = parseAmountFromDisplay;
export const formatAmountBRL = formatAmountToDisplay;

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: amountCodec,
  dateTime: z
    .string()
    .min(1, "Data é obrigatória")
    .refine((date) => {
      if (!date) return false;
      let inputDate: Date;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        const parts = date.split("/").map(Number);
        const day = parts[0]!;
        const month = parts[1]!;
        const year = parts[2]!;
        inputDate = new Date(year, month - 1, day);
      } else {
        inputDate = new Date(date);
      }
      if (isNaN(inputDate.getTime())) return false;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const checkDate = new Date(
        inputDate.getFullYear(),
        inputDate.getMonth(),
        inputDate.getDate(),
      );
      return checkDate <= today;
    }, "A data não pode ser futura"),
  categoryId: optionalSelectWithNoneCodec,
  status: z.enum(["confirmed", "pending", "cancelled"]),
  paymentMethod: optionalSelectWithNoneCodec,
  notes: optionalNotesCodec,
});

export type TransactionFormValues = z.input<typeof transactionSchema>;
export type ParsedTransactionFormValues = z.output<typeof transactionSchema>;

/**
 * Converts a display date (dd/mm/yyyy) to ISO datetime string (UTC).
 * Returns the date at midnight UTC in ISO format.
 */
export const convertDateToISO = (value: string): string => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return value;
  const [, day, month, year] = match;
  // Create date at midnight UTC and return ISO string
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.toISOString();
};
