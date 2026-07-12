"use client";

import { usePsychologistTimezone } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { usePatientSessions } from "@workspace/supabase-data/hooks/sessions";
import { nowInTimezone, utcIsoToWallClockDate } from "@workspace/ui/lib/timezone-datetime";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Calendar, CheckCircle, Clock, TrendingUp, XCircle } from "lucide-react";

import {
  PatientDetailCardErrorState,
  PatientDetailCardLoadingState,
} from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";

export interface PatientSessionsStatsSectionProps {
  patientId: string;
}

type SessionWithStartTime = NonNullable<ReturnType<typeof usePatientSessions>["data"]>[number] & {
  start_time: string;
};

export function PatientSessionsStatsSection({ patientId }: PatientSessionsStatsSectionProps) {
  const { data: sessions, isPending, error } = usePatientSessions(patientId);
  const userTimezone = usePsychologistTimezone();

  if (isPending) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Estatísticas de Sessões" />
        <PatientDetailCardLoadingState message="Carregando estatísticas..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Estatísticas de Sessões" />
        <PatientDetailCardErrorState message="Erro ao carregar estatísticas." />
      </section>
    );
  }

  if (!sessions) return null;

  // Calculate statistics
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.status === "completed").length;
  const cancelledSessions = sessions.filter((s) => s.status === "cancelled").length;
  const noShowSessions = sessions.filter((s) => s.status === "no_show").length;

  // Attendance rate
  const attendanceRate =
    completedSessions + cancelledSessions + noShowSessions > 0
      ? Math.round(
          (completedSessions / (completedSessions + cancelledSessions + noShowSessions)) * 100,
        )
      : 0;

  // Next scheduled session
  const now = nowInTimezone(userTimezone);
  const upcomingSessions = sessions
    .filter(
      (s): s is SessionWithStartTime =>
        s.status === "scheduled" &&
        typeof s.start_time === "string" &&
        utcIsoToWallClockDate(s.start_time, userTimezone).getTime() > now.getTime(),
    )
    .sort((a, b) => {
      const startA = utcIsoToWallClockDate(a.start_time, userTimezone);
      const startB = utcIsoToWallClockDate(b.start_time, userTimezone);
      return startA.getTime() - startB.getTime();
    });
  const nextSession = upcomingSessions[0];

  // Calculate days until next session
  const nextSessionStart = nextSession?.start_time
    ? utcIsoToWallClockDate(nextSession.start_time, userTimezone)
    : null;
  const daysUntilNextSession = nextSessionStart
    ? Math.ceil((nextSessionStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Format next session date
  const nextSessionDate = nextSessionStart
    ? format(nextSessionStart, "EEE, d 'de' MMM", { locale: ptBR }).replace(/^./, (char) =>
        char.toUpperCase(),
      )
    : null;

  return (
    <section className="space-y-6">
      <PatientDetailSubheader title="Estatísticas de Sessões" />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Sessions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Total de Sessões</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{totalSessions}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="size-3" />
              {completedSessions} realizadas
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="size-3" />
              {cancelledSessions} canceladas
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="size-3" />
              {noShowSessions} faltas
            </span>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Taxa de Comparecimento</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{attendanceRate}%</p>
          <p className="text-xs text-muted-foreground">
            {completedSessions} de {completedSessions + cancelledSessions + noShowSessions} sessões
          </p>
        </div>

        {/* Next Session */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Próxima Sessão</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {daysUntilNextSession !== null ? `${daysUntilNextSession} dias` : "—"}
          </p>
          {nextSessionDate && <p className="text-xs text-muted-foreground">{nextSessionDate}</p>}
        </div>
      </div>
    </section>
  );
}
