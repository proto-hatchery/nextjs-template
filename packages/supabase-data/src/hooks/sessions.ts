"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";

import { getClinicalSessionDetailsAction } from "../actions/sessions/get-clinical-session-details";
import { getOldestOpenSessionAction } from "../actions/sessions/get-oldest-open-session";
import { getPsychologistClinicalSessionsAction } from "../actions/sessions/get-psychologist-clinical-sessions";
import { listPatientDashboardSessionsAction } from "../actions/sessions/list-patient-dashboard-sessions";
import { listPatientSessionsAction } from "../actions/sessions/list-patient-sessions";
import { listTodaySessionsAction } from "../actions/sessions/list-today-sessions";
import { listUpcomingSessionsAction } from "../actions/sessions/list-upcoming-sessions";
import { unwrapActionResult } from "../lib/boundary/unwrap-action";
import type { SessionFilters, SessionWithDetails } from "../types/entities";
import { usePsychologistTimezone } from "./psychologists/use-psychologist-queries";

const SessionsResponseSchema = z.object({
  sessions: z.array(z.any()),
});
const SessionResponseSchema = z.object({
  session: z.any(),
});
const SessionArraySchema = z.array(z.any());
const SingleSessionSchema = z.any();

export function usePsychologistClinicalSessions(
  filters?: SessionFilters,
): UseQueryResult<SessionWithDetails[], Error> {
  const userTimezone = usePsychologistTimezone();

  return useQuery({
    queryKey: ["sessions", "list", filters, userTimezone],
    queryFn: async () => {
      const data = unwrapActionResult(
        await getPsychologistClinicalSessionsAction({
          status: filters?.status,
          patientId: filters?.patientId,
          startDate: filters?.startDate,
          endDate: filters?.endDate,
          limit: filters?.limit,
          offset: filters?.offset,
        }),
        SessionArraySchema,
      );
      return data as SessionWithDetails[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePsychologistClinicalSessionDetails(
  sessionId: string | undefined,
): UseQueryResult<SessionWithDetails | null, Error> {
  const userTimezone = usePsychologistTimezone();

  return useQuery({
    queryKey: ["sessions", "detail", sessionId, userTimezone],
    queryFn: async () => {
      if (!sessionId) return null;
      const data = unwrapActionResult(
        await getClinicalSessionDetailsAction({ sessionId, timezone: userTimezone }),
        SessionResponseSchema,
      );
      return data.session as SessionWithDetails | null;
    },
    enabled: Boolean(sessionId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpcomingSessions(limit = 10): UseQueryResult<SessionWithDetails[], Error> {
  const userTimezone = usePsychologistTimezone();

  return useQuery({
    queryKey: ["sessions", "upcoming", limit, userTimezone],
    queryFn: async () => {
      const data = unwrapActionResult(
        await listUpcomingSessionsAction({ limit, timezone: userTimezone }),
        SessionsResponseSchema,
      );
      return data.sessions as SessionWithDetails[];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function usePatientSessions(
  patientId: string | undefined,
): UseQueryResult<SessionWithDetails[], Error> {
  const userTimezone = usePsychologistTimezone();

  return useQuery({
    queryKey: ["sessions", "by-patient", patientId, userTimezone],
    queryFn: async () => {
      if (!patientId) return [];
      const data = unwrapActionResult(
        await listPatientSessionsAction({ patientId, limit: 50, timezone: userTimezone }),
        SessionsResponseSchema,
      );
      return data.sessions as SessionWithDetails[];
    },
    enabled: Boolean(patientId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTodaySessions(): UseQueryResult<SessionWithDetails[], Error> {
  const userTimezone = usePsychologistTimezone();

  return useQuery({
    queryKey: ["sessions", "today", userTimezone],
    queryFn: async () => {
      const data = unwrapActionResult(
        await listTodaySessionsAction({ timezone: userTimezone }),
        SessionsResponseSchema,
      );
      return data.sessions as SessionWithDetails[];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useOldestOpenSession(): UseQueryResult<SessionWithDetails | null, Error> {
  return useQuery({
    queryKey: ["sessions", "oldest-open"],
    queryFn: async () => {
      const data = unwrapActionResult(
        await getOldestOpenSessionAction(),
        SingleSessionSchema.nullable(),
      );
      return data as SessionWithDetails | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePatientDashboardSessions(
  limit = 50,
): UseQueryResult<SessionWithDetails[], Error> {
  const userTimezone = usePsychologistTimezone();

  return useQuery({
    queryKey: ["sessions", "patient-dashboard", limit, userTimezone],
    queryFn: async () => {
      const data = unwrapActionResult(
        await listPatientDashboardSessionsAction({ limit, timezone: userTimezone }),
        SessionsResponseSchema,
      );
      return data.sessions as SessionWithDetails[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
