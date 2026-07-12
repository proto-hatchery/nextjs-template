import { normalizeOptionalStringValue, toRHFEmptyString } from "@workspace/forms/v2/kernel";
import { createRequiredSelectIdCodec, optionalSelectIdCodec } from "@workspace/forms/v2/schema";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

export const formatCurrencyBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const parseCurrencyBRL = (value: string): number => {
  const normalized = value
    .replace(/[^\d,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const parseDateInputToIso = (value: string): string | undefined => {
  const normalized = normalizeOptionalStringValue(value);
  if (!normalized) {
    return undefined;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const parsed = parseISO(normalized);
    return isValid(parsed) ? normalized : undefined;
  }

  const [dayRaw, monthRaw, yearRaw] = normalized.split("/");
  if (!dayRaw || !monthRaw || yearRaw?.length !== 4) {
    return undefined;
  }

  const day = Number(dayRaw);
  const month = Number(monthRaw);
  const year = Number(yearRaw);
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return undefined;
  }

  const iso = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const parsed = parseISO(iso);
  if (!isValid(parsed)) {
    return undefined;
  }

  const isSameCalendarDate =
    parsed.getFullYear() === year && parsed.getMonth() + 1 === month && parsed.getDate() === day;

  return isSameCalendarDate ? iso : undefined;
};

export const formatIsoToDateInput = (value: string | undefined): string => {
  const normalized = normalizeOptionalStringValue(value);
  if (!normalized) {
    return "";
  }

  const parsed = parseISO(normalized);
  if (!isValid(parsed)) {
    return "";
  }

  return format(parsed, "dd/MM/yyyy");
};

export const amountCodec = z.codec(
  z.string(),
  z
    .number({ error: "Informe o valor da cobrança" })
    .finite("Informe um valor válido")
    .positive("Informe um valor maior que zero"),
  {
    decode: (value) => parseCurrencyBRL(value),
    encode: (value) => (value > 0 ? formatCurrencyBRL(value) : ""),
  },
);

export const dueDateCodec = z.codec(z.string(), z.string().optional(), {
  decode: (value) => parseDateInputToIso(value),
  encode: (value) => toRHFEmptyString(formatIsoToDateInput(value)),
});

export const createChargeSchema = z.object({
  patientId: createRequiredSelectIdCodec("Selecione o paciente"),
  serviceId: optionalSelectIdCodec,
  sessionId: optionalSelectIdCodec,
  amount: amountCodec,
  dueDate: dueDateCodec,
  paymentStatus: z.enum(["pending", "paid", "overdue", "refunded", "cancelled"]).default("pending"),
});

export type ChargeFormValues = z.input<typeof createChargeSchema>;
export type ChargeSubmitValues = z.output<typeof createChargeSchema>;
export type CreateChargeStep = 1 | 2 | 3;

export const centsToBRL = (value?: number | null) => {
  if (value === null || value === undefined) return null;
  return Number((value / 100).toFixed(2));
};

export const formatDatePreview = (value?: string) => {
  if (!value) return "Sem vencimento";
  try {
    const parsed = parseISO(value);
    if (!isValid(parsed)) return "Sem vencimento";
    return format(parsed, "dd MMM", { locale: ptBR });
  } catch {
    return "Sem vencimento";
  }
};
