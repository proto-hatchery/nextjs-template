import { z } from "zod";

const formatCurrencyBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const parseCurrencyBRL = (value: string): number => {
  const normalized = value
    .replace(/[^\d,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
};

const amountCodec = z.codec(
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

export const updateMethodSchema = z.object({
  method: z.enum(["fluripay", "card", "cash", "pix", "bank_transfer", "other"]),
});

export const updateValueSchema = z.object({
  amount: amountCodec,
});

export type UpdateMethodFormValues = z.input<typeof updateMethodSchema>;
export type UpdateMethodSubmitValues = z.output<typeof updateMethodSchema>;

export type UpdateValueFormValues = z.input<typeof updateValueSchema>;
export type UpdateValueSubmitValues = z.output<typeof updateValueSchema>;

export const methodOptions = [
  { value: "fluripay", label: "FluriPay" },
  { value: "card", label: "Cartão" },
  { value: "cash", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "bank_transfer", label: "Transferência Bancária" },
  { value: "other", label: "Outro" },
];
