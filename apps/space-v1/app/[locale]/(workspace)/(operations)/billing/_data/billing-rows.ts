import type { ChargeWithRelations } from "@workspace/supabase-data/types/entities";

import { resolveBillingPatientName } from "../_utils/patient-name";
import type { BillingRow } from "../types/billing-row";

const validBillingStatuses: BillingRow["status"][] = [
  "pending",
  "paid",
  "overdue",
  "cancelled",
  "refunded",
];

function isValidBillingStatus(status: string): status is BillingRow["status"] {
  return validBillingStatuses.includes(status as BillingRow["status"]);
}

export function transformBillingToRow(billing: ChargeWithRelations): BillingRow {
  const dateSource = billing.session?.start_time ?? billing.created_at;
  const paymentStatus = billing.payment_status ?? "pending";
  const status = isValidBillingStatus(paymentStatus) ? paymentStatus : "pending";

  return {
    id: billing.id,
    createdAt: dateSource
      ? new Date(dateSource).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-",
    patient: (() => {
      const client = billing.patient;
      if (!client) return "Sem nome";
      return resolveBillingPatientName(client);
    })(),
    avatarUrl: null,
    services: billing.description ?? "Sessão",
    amount: `R$ ${(Number(billing.price_cents ?? 0) / 100).toFixed(2)}`,
    method: billing.payment_method ?? "-",
    status,
    document: "not_issued" as const,
  };
}

export function transformBillingsToRows(billings: ChargeWithRelations[]): BillingRow[] {
  return billings.map(transformBillingToRow);
}
