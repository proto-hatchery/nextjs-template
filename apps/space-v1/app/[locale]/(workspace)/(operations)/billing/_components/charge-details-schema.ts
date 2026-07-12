import { z } from "zod";

export const chargeDetailsSchema = z.object({
  status: z.enum(["pending", "paid", "overdue", "cancelled", "refunded"]),
  method: z.enum(["fluripay", "card", "cash", "pix", "bank_transfer", "other"]),
});

export type ChargeDetailsFormValues = z.input<typeof chargeDetailsSchema>;
export type ChargeDetailsSubmitValues = z.output<typeof chargeDetailsSchema>;
export type ChargeDetailsFormOutput = z.infer<typeof chargeDetailsSchema>;

export const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "paid", label: "Pago" },
  { value: "overdue", label: "Atrasado" },
  { value: "cancelled", label: "Cancelada" },
  { value: "refunded", label: "Reembolsado" },
];

export const methodOptions = [
  { value: "fluripay", label: "FluriPay" },
  { value: "card", label: "Cartão" },
  { value: "cash", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "bank_transfer", label: "Transferência Bancária" },
  { value: "other", label: "Outro" },
];
