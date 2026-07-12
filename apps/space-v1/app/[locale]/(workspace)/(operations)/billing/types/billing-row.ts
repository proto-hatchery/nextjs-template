export interface BillingRow {
  id: string;
  createdAt: string;
  patient: string;
  avatarUrl?: string | null;
  services: string;
  amount: string;
  method: string;
  status: "pending" | "paid" | "overdue" | "cancelled" | "refunded";
  document: "issued" | "not_issued";
}
