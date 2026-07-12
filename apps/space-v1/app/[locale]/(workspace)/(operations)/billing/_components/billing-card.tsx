"use client";

import { RiBankCard2Fill, RiBankFill, RiMoneyDollarCircleFill } from "@remixicon/react";
import type { ChargeWithRelations } from "@workspace/supabase-data/types/entities";
import { FluriLogo } from "@workspace/brand/components/fluri-logo";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Sensitive } from "@workspace/core/privacy/sensitive";
import { AlertCircle } from "lucide-react";
import * as React from "react";

import { resolveBillingPatientName } from "../_utils/patient-name";

interface BillingCardProps {
  charge: ChargeWithRelations;
  onClick: () => void;
}

// Wrapper for FluriLogo to match icon component interface
function FluriPayIcon({ className: _className }: { className?: string | undefined }) {
  return (
    <div className="flex items-center justify-center">
      <div style={{ width: 65, height: 24 }}>
        <FluriLogo app="space" className="w-full h-full" />
      </div>
    </div>
  );
}

interface PaymentMethodIconInfo {
  icon: React.ComponentType<{ className?: string | undefined }>;
  color: string;
  isRemixIcon?: boolean;
}

// Payment method icons mapping
const PAYMENT_METHOD_ICONS: Record<string, PaymentMethodIconInfo> = {
  pix: { icon: RiMoneyDollarCircleFill, color: "text-foreground", isRemixIcon: true },
  card: { icon: RiBankCard2Fill, color: "text-foreground", isRemixIcon: true },
  credit_card: { icon: RiBankCard2Fill, color: "text-foreground", isRemixIcon: true },
  debit_card: { icon: RiBankCard2Fill, color: "text-foreground", isRemixIcon: true },
  bank_slip: { icon: RiBankFill, color: "text-foreground", isRemixIcon: true },
  bank_transfer: { icon: RiBankFill, color: "text-foreground", isRemixIcon: true },
  fluri_pay: { icon: FluriPayIcon, color: "text-foreground", isRemixIcon: false },
  fluripay: { icon: FluriPayIcon, color: "text-foreground", isRemixIcon: false },
  cash: { icon: RiMoneyDollarCircleFill, color: "text-foreground", isRemixIcon: true },
};

const DEFAULT_PAYMENT_METHOD: PaymentMethodIconInfo = {
  icon: RiBankCard2Fill,
  color: "text-foreground",
  isRemixIcon: true,
};

function getPaymentMethodIcon(method?: string | null): PaymentMethodIconInfo {
  const methodKey = method ?? "credit_card";
  return PAYMENT_METHOD_ICONS[methodKey] ?? DEFAULT_PAYMENT_METHOD;
}

export function BillingCard({ charge, onClick }: BillingCardProps) {
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((charge.price_cents ?? 0) / 100);

  // Format date: dd/MM for current year, dd/MM/yyyy for other years (use session date when available)
  const chargeDate = new Date(charge.session?.start_time ?? charge.created_at ?? new Date());
  const currentYear = new Date().getFullYear();
  const chargeYear = chargeDate.getFullYear();
  const formattedDate =
    chargeYear === currentYear
      ? new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }).format(chargeDate)
      : new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(chargeDate);

  const paymentMethodInfo = getPaymentMethodIcon(charge.payment_method);
  const PaymentIcon = paymentMethodInfo.icon;
  const isRemixIcon = paymentMethodInfo.isRemixIcon ?? true;

  // Check if charge is overdue
  const isPending = charge.payment_status === "pending";
  const dueDate = charge.due_date ? new Date(charge.due_date) : null;
  const isOverdue = isPending && dueDate && dueDate < new Date();

  // Get service name from session
  const service = charge.session?.service;
  const serviceData = (Array.isArray(service) ? service[0] : service) as unknown as {
    name?: string | null;
    reference?: { name: string | null } | null;
  };
  const serviceName = serviceData?.reference?.name ?? serviceData?.name ?? null;

  // Get patient name from patient relation
  const patientName = resolveBillingPatientName(charge.patient ?? null);

  return (
    <BrandButton
      variant="ghost"
      onClick={onClick}
      className="flex items-center w-full gap-3 px-1 py-4 h-auto text-left justify-start"
    >
      {/* Payment Method Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground">
        {isRemixIcon ? <PaymentIcon className="h-6 w-6" /> : <PaymentIcon />}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col truncate">
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-bold text-foreground truncate tracking-tight">
            <Sensitive variant="blur" redactedLabel="Nome do paciente oculto">
              {patientName.toUpperCase()}
            </Sensitive>
          </span>
          {isOverdue && <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />}
        </div>
        <span className="text-sm font-medium text-muted-foreground truncate">
          {serviceName ?? "Serviço"}
        </span>
      </div>

      {/* Amount and Date */}
      <div className="flex flex-col items-end gap-1">
        <Sensitive variant="blur" redactedLabel="Valor oculto">
          <span
            className={cn(
              "text-[15px] font-bold tracking-tight",
              isOverdue ? "text-red-500" : "text-emerald-600 dark:text-emerald-400",
            )}
          >
            {formattedAmount}
          </span>
        </Sensitive>
        <span className="text-xs text-muted-foreground font-medium">{formattedDate}</span>
      </div>
    </BrandButton>
  );
}
