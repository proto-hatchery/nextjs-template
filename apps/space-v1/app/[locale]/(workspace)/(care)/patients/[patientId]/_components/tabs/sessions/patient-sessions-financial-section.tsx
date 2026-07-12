"use client";

import { useCharges } from "@workspace/supabase-data/hooks/billing";
import { usePsychologistTimezone } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { usePatientSessions } from "@workspace/supabase-data/hooks/sessions";
import {
  nowInTimezone,
  utcIsoToWallClockDate,
  wallClockDateToYmd,
} from "@workspace/ui/lib/timezone-datetime";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, DollarSign, Wallet } from "lucide-react";
import { TrendingDown } from "lucide-react";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

import {
  PatientDetailCardEmptyState,
  PatientDetailCardErrorState,
  PatientDetailCardLoadingState,
} from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";

export interface PatientSessionsFinancialSectionProps {
  patientId: string;
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  overdue: "Atrasado",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  paid: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  refunded: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  overdue: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  fluripay: "FluriPay",
  card: "Cartão",
  cash: "Dinheiro",
  pix: "PIX",
  bank_transfer: "Transferência",
  other: "Outro",
};

export function PatientSessionsFinancialSection({
  patientId,
}: PatientSessionsFinancialSectionProps) {
  const userTimezone = usePsychologistTimezone();

  const { data: sessions, isPending: isPendingSessions } = usePatientSessions(patientId);

  // Query to fetch billings
  const {
    data: billings,
    isPending: isPendingBillings,
    error,
    refetch,
  } = useCharges({ patientId });

  const isPending = isPendingSessions || isPendingBillings;

  if (isPending) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Controle Financeiro" />
        <PatientDetailCardLoadingState message="Carregando dados financeiros..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Controle Financeiro" />
        <PatientDetailCardErrorState
          message="Erro ao carregar dados financeiros."
          onRetry={() => void refetch()}
        />
      </section>
    );
  }

  const patientSessions = sessions ?? [];
  const billingsList = billings ?? [];

  // Calculate financial stats
  const completedSessions = patientSessions.filter((s) => s.status === "completed");

  // Calculate total from all billings (single source of truth)
  const totalBilled = billingsList.reduce(
    (sum: number, b) => sum + Number(b.price_cents ?? 0) / 100,
    0,
  );

  const paidBillings = billingsList.filter((b) => b.payment_status === "paid");
  const totalPaid = paidBillings.reduce(
    (sum: number, b) => sum + Number(b.price_cents ?? 0) / 100,
    0,
  );

  const pendingBillings = billingsList.filter((b) => b.payment_status === "pending");
  const totalPending = pendingBillings.reduce(
    (sum: number, b) => sum + Number(b.price_cents ?? 0) / 100,
    0,
  );

  const now = nowInTimezone(userTimezone);
  const todayYmd = wallClockDateToYmd(now);
  const overdueBillings = pendingBillings.filter((b) => {
    const dueDate = typeof b.due_date === "string" ? b.due_date.slice(0, 10) : null;
    return !!dueDate && dueDate < todayYmd;
  });
  const totalOverdue = overdueBillings.reduce(
    (sum: number, b) => sum + Number(b.price_cents ?? 0) / 100,
    0,
  );

  // Average session price: total of all charges / number of charges
  const avgSessionPrice = billingsList.length > 0 ? totalBilled / billingsList.length : 0;

  if (billingsList.length === 0) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Controle Financeiro" />

        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Total Faturado</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">R$ {totalBilled.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              {completedSessions.length} sessões realizadas
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Valor Médio</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              R$ {avgSessionPrice.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Por sessão</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Cobranças</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">Nenhuma cobrança registrada</p>
          </div>
        </div>

        <PatientDetailCardEmptyState
          icon={DollarSign}
          title="Nenhuma cobrança registrada"
          subtitle="As cobranças deste paciente serão geradas automaticamente a partir das sessões faturáveis."
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PatientDetailSubheader title="Controle Financeiro" />

      {/* Financial Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Billed */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Total Faturado</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">R$ {totalBilled.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            {completedSessions.length} sessões realizadas
          </p>
        </div>

        {/* Total Paid */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">Total Pago</span>
          </div>
          <p className="text-2xl font-semibold text-green-600">R$ {totalPaid.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{paidBillings.length} pagamentos</p>
        </div>

        {/* Total Pending */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="size-4 text-yellow-600" />
            <span className="text-sm font-medium text-foreground">Total Pendente</span>
          </div>
          <p className="text-2xl font-semibold text-yellow-600">R$ {totalPending.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{pendingBillings.length} cobranças</p>
        </div>

        {/* Average Value */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">Valor Médio por Sessão</span>
          <p className="text-base text-foreground">R$ {avgSessionPrice.toFixed(2)}</p>
        </div>

        {/* Total Overdue */}
        {totalOverdue > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-red-600" />
              <span className="text-sm font-medium text-foreground">Total Atrasado</span>
            </div>
            <p className="text-base font-semibold text-red-600">R$ {totalOverdue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{overdueBillings.length} cobranças</p>
          </div>
        )}
      </div>

      {/* Billings List */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-foreground">Cobranças Recentes</h3>
        <div className="space-y-3">
          {billingsList.slice(0, 10).map((billing) => {
            const statusLabel = billing.payment_status
              ? (PAYMENT_STATUS_LABELS[billing.payment_status] ?? billing.payment_status)
              : "Desconhecido";
            const statusColor = billing.payment_status
              ? (PAYMENT_STATUS_COLORS[billing.payment_status] ?? "bg-gray-500/10 text-gray-700")
              : "bg-gray-500/10 text-gray-700";
            const paymentMethod = billing.payment_method
              ? (PAYMENT_METHOD_LABELS[billing.payment_method] ?? billing.payment_method)
              : null;

            return (
              <div
                key={billing.id}
                className="group flex w-full items-start justify-between gap-4 rounded-2xl bg-muted/40 px-4 py-3 text-left transition-colors hover:bg-muted/60"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {/* Amount and Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      R$ {(Number(billing.price_cents ?? 0) / 100).toFixed(2)}
                    </span>
                    <span
                      className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusColor)}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {billing.description && <span>{billing.description}</span>}
                    {paymentMethod && <span>Método: {paymentMethod}</span>}
                    {billing.due_date && (
                      <span>
                        Vencimento: {billing.due_date.slice(8, 10)}/{billing.due_date.slice(5, 7)}/
                        {billing.due_date.slice(0, 4)}
                      </span>
                    )}
                    {billing.paid_at && (
                      <span>
                        Pago em:{" "}
                        {format(
                          utcIsoToWallClockDate(billing.paid_at, userTimezone),
                          "dd/MM/yyyy",
                          {
                            locale: ptBR,
                          },
                        )}
                      </span>
                    )}
                  </div>

                  {/* Linked Session */}
                  {billing.sessionDate && (
                    <div className="text-xs text-muted-foreground">
                      Sessão:{" "}
                      {format(
                        utcIsoToWallClockDate(billing.sessionDate, userTimezone),
                        "dd/MM/yyyy 'às' HH:mm",
                        {
                          locale: ptBR,
                        },
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {billingsList.length > 10 && (
          <div className="mt-4 text-center">
            <BrandButton variant="ghost" size="sm" asChild>
              <Link href={`/billing?patient=${patientId}`}>
                Ver todas as cobranças ({billingsList.length})
              </Link>
            </BrandButton>
          </div>
        )}
      </div>
    </section>
  );
}
