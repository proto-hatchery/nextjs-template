"use client";

import { useQuery } from "@tanstack/react-query";
import { getPatientCountAction } from "@workspace/supabase-data/actions/patients/get-patient-count";
import { useFinancialSummary } from "@workspace/supabase-data/hooks/finances";
import { usePsychologistTimezone } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { usePsychologistClinicalSessions } from "@workspace/supabase-data/hooks/sessions";
import { nowInTimezone, wallClockDateToUtcIso } from "@workspace/ui/lib/timezone-datetime";
import { useMemo } from "react";

import { StatsCardsSkeleton } from "./skeletons";
import { StatsCards } from "./stats-cards";

const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";

export function StatsSection() {
  const userTimezone = usePsychologistTimezone();
  const period = useMemo(() => {
    const now = nowInTimezone(userTimezone);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    return {
      startDate: wallClockDateToUtcIso(monthStart, userTimezone),
      endDate: wallClockDateToUtcIso(todayEnd, userTimezone),
    };
  }, [userTimezone]);

  const {
    data: completedSessions,
    isPending: isSessionsPending,
    error: sessionsError,
  } = usePsychologistClinicalSessions({
    status: "completed",
    startDate: period.startDate,
    endDate: period.endDate,
  });

  const {
    data: summary,
    isPending: isSummaryPending,
    error: summaryError,
  } = useFinancialSummary(period);

  const {
    data: activePatientsCount = 0,
    isPending: isPatientsPending,
    error: patientsError,
  } = useQuery({
    queryKey: ["patients", "count", "active"],
    queryFn: async () => {
      const result = await getPatientCountAction({ status: "active" });
      if (!result.success) throw new Error(result.error?.message ?? "Failed to load patient count");
      return result.data.count;
    },
    staleTime: 5 * 60 * 1000,
  });

  const pending = isSessionsPending || isSummaryPending || isPatientsPending;
  const sessionsFailed = !!sessionsError;
  const summaryFailed = !!summaryError;
  const patientsFailed = !!patientsError;
  const anyFailed = sessionsFailed || summaryFailed || patientsFailed;

  if (pending && !anyFailed) {
    return <StatsCardsSkeleton />;
  }

  if (anyFailed && isDev) {
    // Errors are already reflected in the UI
  }

  if (anyFailed) {
    const failedLabels: string[] = [];
    if (sessionsFailed) failedLabels.push("sessões concluídas");
    if (summaryFailed) failedLabels.push("receita");
    if (patientsFailed) failedLabels.push("pacientes ativos");

    const allFailed = sessionsFailed && summaryFailed && patientsFailed;
    if (allFailed) {
      return (
        <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
          Não foi possível carregar os indicadores agora.
          {isDev && (
            <p className="mt-2 text-xs opacity-80">
              Falhas: {failedLabels.join(", ")}. Verifique o console (F12) para detalhes.
            </p>
          )}
        </div>
      );
    }

    const stats = {
      sessions_completed: sessionsFailed ? 0 : (completedSessions?.length ?? 0),
      monthly_revenue: summaryFailed ? 0 : (summary?.totalIncome ?? 0) / 100,
      active_patients: patientsFailed ? 0 : activePatientsCount,
      attendance_rate: 0,
      revenue_growth_percent: 0,
      sessions_growth_percent: 0,
    };
    return (
      <>
        <StatsCards stats={stats} />
        <p className="mt-2 text-xs text-muted-foreground">
          Alguns indicadores não carregaram: {failedLabels.join(", ")}.
          {isDev && " Verifique o console (F12) para detalhes."}
        </p>
      </>
    );
  }

  const stats = {
    sessions_completed: completedSessions?.length ?? 0,
    monthly_revenue: (summary?.totalIncome ?? 0) / 100,
    active_patients: activePatientsCount,
    attendance_rate: 0,
    revenue_growth_percent: 0,
    sessions_growth_percent: 0,
  };

  return <StatsCards stats={stats} />;
}
