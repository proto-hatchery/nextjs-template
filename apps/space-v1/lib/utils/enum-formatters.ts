type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Transferência",
  card: "Cartão",
  cash: "Dinheiro",
  fluripay: "FluriPay",
  other: "Outro",
  pix: "Pix",
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; variant: BadgeVariant }> = {
  cancelled: { label: "Cancelada", variant: "destructive" },
  overdue: { label: "Vencida", variant: "destructive" },
  paid: { label: "Paga", variant: "default" },
  pending: { label: "Pendente", variant: "secondary" },
  refunded: { label: "Reembolsada", variant: "outline" },
};

export function formatPaymentMethod(value: string | null | undefined): string {
  if (!value) return "Não informado";
  return PAYMENT_METHOD_LABELS[value] ?? value;
}

export function formatPaymentStatus(value: string | null | undefined): {
  label: string;
  variant: BadgeVariant;
} {
  if (!value) return { label: "Pendente", variant: "secondary" };
  return PAYMENT_STATUS_LABELS[value] ?? { label: value, variant: "outline" };
}
