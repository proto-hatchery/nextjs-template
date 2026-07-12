"use client";

import { usePsychologistTimezone } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { usePatientSessions } from "@workspace/supabase-data/hooks/sessions";
import { utcIsoToWallClockDate } from "@workspace/ui/lib/timezone-datetime";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { useState } from "react";

import { SpaceEventCreationModal } from "../../../../../../_components/session-creation/space-event-creation-modal";
import { PatientDetailCardItem } from "../../shared/patient-detail-card-item";
import {
  PatientDetailCardEmptyState,
  PatientDetailCardErrorState,
  PatientDetailCardLoadingState,
} from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";

export interface PatientSessionsListSectionProps {
  patientId: string;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  completed: "Realizada",
  cancelled: "Cancelada",
  no_show: "Falta",
  confirmed: "Confirmada",
  open: "Em aberto",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  no_show: "bg-red-500/10 text-red-700 dark:text-red-400",
  confirmed: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  open: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  overdue: "Atrasado",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-600 dark:text-yellow-500",
  paid: "text-green-600 dark:text-green-500",
  cancelled: "text-gray-600 dark:text-gray-500",
  refunded: "text-blue-600 dark:text-blue-500",
  overdue: "text-red-600 dark:text-red-500",
};

export function PatientSessionsListSection({ patientId }: PatientSessionsListSectionProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const userTimezone = usePsychologistTimezone();

  // Query to fetch sessions
  const { data: patientSessions, isPending, error, refetch } = usePatientSessions(patientId);

  if (isPending) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Histórico de Sessões" />
        <PatientDetailCardLoadingState message="Carregando sessões..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Histórico de Sessões" />
        <PatientDetailCardErrorState
          message="Erro ao carregar sessões."
          onRetry={() => void refetch()}
        />
      </section>
    );
  }

  const allSessions = patientSessions ?? [];

  // Filter sessions
  const sessions =
    statusFilter === "all" ? allSessions : allSessions.filter((s) => s.status === statusFilter);

  if (allSessions.length === 0) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Histórico de Sessões">
          <BrandButton
            variant="ghost"
            size="sm"
            onClick={() => setIsCreateSessionOpen(true)}
            className="rounded-full px-4"
          >
            Nova sessão
          </BrandButton>
        </PatientDetailSubheader>
        <PatientDetailCardEmptyState
          icon={Calendar}
          title="Nenhuma sessão registrada"
          subtitle="Crie a primeira sessão para este paciente"
        />

        <SpaceEventCreationModal
          isOpen={isCreateSessionOpen}
          onClose={() => setIsCreateSessionOpen(false)}
          defaultPatientId={patientId}
          onSuccess={() => void refetch()}
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PatientDetailSubheader title="Histórico de Sessões">
        <BrandButton
          variant="ghost"
          size="sm"
          onClick={() => setIsCreateSessionOpen(true)}
          className="rounded-full px-4"
        >
          Nova sessão
        </BrandButton>
      </PatientDetailSubheader>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <BrandButton
          variant={statusFilter === "all" ? "default" : "secondary"}
          size="xs"
          className="h-7 rounded-full px-3"
          onClick={() => setStatusFilter("all")}
        >
          Todas ({allSessions.length})
        </BrandButton>
        <BrandButton
          variant={statusFilter === "completed" ? "default" : "secondary"}
          size="xs"
          className="h-7 rounded-full px-3"
          onClick={() => setStatusFilter("completed")}
        >
          Realizadas ({allSessions.filter((s) => s.status === "completed").length})
        </BrandButton>
        <BrandButton
          variant={statusFilter === "scheduled" ? "default" : "secondary"}
          size="xs"
          className="h-7 rounded-full px-3"
          onClick={() => setStatusFilter("scheduled")}
        >
          Agendadas ({allSessions.filter((s) => s.status === "scheduled").length})
        </BrandButton>
        <BrandButton
          variant={statusFilter === "open" ? "default" : "secondary"}
          size="xs"
          className="h-7 rounded-full px-3"
          onClick={() => setStatusFilter("open")}
        >
          Em aberto ({allSessions.filter((s) => s.status === "open").length})
        </BrandButton>
        <BrandButton
          variant={statusFilter === "cancelled" ? "default" : "secondary"}
          size="xs"
          className="h-7 rounded-full px-3"
          onClick={() => setStatusFilter("cancelled")}
        >
          Canceladas ({allSessions.filter((s) => s.status === "cancelled").length})
        </BrandButton>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <PatientDetailCardEmptyState
          icon={Calendar}
          title="Nenhuma sessão encontrada com este filtro"
          subtitle="Tente outro filtro ou crie uma nova sessão"
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const sessionStart = session.start_time
              ? utcIsoToWallClockDate(session.start_time, userTimezone)
              : null;
            const sessionDate = sessionStart
              ? format(sessionStart, "dd/MM/yyyy", { locale: ptBR })
              : "—";
            const sessionTime = sessionStart
              ? format(sessionStart, "HH:mm", { locale: ptBR })
              : "—";
            const statusLabel = session.status
              ? (STATUS_LABELS[session.status] ?? session.status)
              : "Desconhecido";
            const statusColor = session.status
              ? (STATUS_COLORS[session.status] ?? "bg-gray-500/10 text-gray-700")
              : "bg-gray-500/10 text-gray-700";

            // Format additional information
            const details: string[] = [];
            if (session.serviceName) {
              details.push(
                session.duration_minutes
                  ? `${session.serviceName} • ${session.duration_minutes} min`
                  : session.serviceName,
              );
            }
            if (session.locationName) {
              details.push(session.locationName);
            }
            const sessionPrice = session.snapshot_price_cents ?? session.charge?.price_cents;
            if (sessionPrice) {
              details.push(
                new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(sessionPrice / 100),
              );
            }

            return (
              <PatientDetailCardItem
                key={session.id}
                icon={<Calendar className="size-5 text-muted-foreground" />}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {sessionDate} às {sessionTime}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                      statusColor,
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {details.length > 0 ? details.join(" • ") : "Sem detalhes adicionais"}
                  {session.charge && (
                    <>
                      {" • "}
                      <span
                        className={
                          PAYMENT_STATUS_COLORS[session.charge.payment_status ?? "pending"]
                        }
                      >
                        {PAYMENT_STATUS_LABELS[session.charge.payment_status ?? "pending"]}
                      </span>
                      {session.charge.due_date && session.charge.payment_status === "pending" && (
                        <>
                          {" • Vence em "}
                          {format(new Date(session.charge.due_date), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </>
                      )}
                    </>
                  )}
                </p>
              </PatientDetailCardItem>
            );
          })}
        </div>
      )}

      <SpaceEventCreationModal
        isOpen={isCreateSessionOpen}
        onClose={() => setIsCreateSessionOpen(false)}
        defaultPatientId={patientId}
        onSuccess={() => void refetch()}
      />
    </section>
  );
}
