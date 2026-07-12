"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";
import {
  fetchCalendarEvent,
  fetchCalendarEvents,
  fetchCalendarEventSeries,
  fetchCalendarEventSeriesById,
  fetchCalendarViewEvents,
  fetchPatientCalendarEvents,
} from "../modules/calendar/application/calendar-queries";
import { fetchCalendarHolidays } from "../modules/calendar/application/calendar-holiday-queries";
import {
  fetchGoogleCalendarConnection,
  fetchGoogleSyncLogs,
  fetchLastSyncTimestamp,
  fetchPendingSyncCount,
  fetchRecentSyncErrorCount,
  hasActiveGoogleCalendarConnection,
} from "../modules/calendar/application/google-calendar-queries";
import type {
  CalendarEventFilters,
  CalendarEventSeriesFilters,
  CalendarEventType,
  CalendarHoliday,
  CalendarHolidayFilters,
  CalendarViewEvent,
  GoogleCalendarConnectionWithStatus,
  GoogleSyncLogFilters,
} from "../types/entities";

async function getClientUserId(): Promise<string | null> {
  const supabase = createBrowserAuthClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export function useCalendarEvents(filters?: CalendarEventFilters) {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: ["calendar-events", "list", filters],
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return [];
      return fetchCalendarEvents(supabase, userId, filters);
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function useCalendarEvent(eventId: string | undefined) {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: ["calendar-events", "detail", eventId],
    queryFn: () => fetchCalendarEvent(supabase, eventId!),
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000,
  });
}

export function useCalendarViewEvents(
  startDate: string | undefined,
  endDate: string | undefined,
  eventTypes?: CalendarEventType[],
): UseQueryResult<CalendarViewEvent[], Error> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: ["calendar-events", "view", startDate, endDate, eventTypes],
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId || !startDate || !endDate) return [];
      return fetchCalendarViewEvents(supabase, userId, startDate, endDate, eventTypes);
    },
    enabled: !!startDate && !!endDate,
    staleTime: 1 * 60 * 1000,
  });
}

export function usePatientCalendarEvents(
  patientId: string | undefined,
  filters?: Omit<CalendarEventFilters, "patientId">,
) {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: ["calendar-events", "by-patient", patientId, filters],
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId || !patientId) return [];
      return fetchPatientCalendarEvents(supabase, userId, patientId, filters);
    },
    enabled: !!patientId,
    staleTime: 1 * 60 * 1000,
  });
}

export function useCalendarEventSeries(filters?: CalendarEventSeriesFilters) {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: ["calendar-events", "series", filters],
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return [];
      return fetchCalendarEventSeries(supabase, userId, filters);
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function useCalendarEventSeriesDetail(seriesId: string | undefined) {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: ["calendar-events", "series-detail", seriesId],
    queryFn: () => fetchCalendarEventSeriesById(supabase, seriesId!),
    enabled: !!seriesId,
    staleTime: 1 * 60 * 1000,
  });
}

export function useCalendarHolidays(
  filters: CalendarHolidayFilters,
): UseQueryResult<CalendarHoliday[], Error> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: ["calendar-holidays", filters],
    queryFn: () => fetchCalendarHolidays(supabase, filters),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useCalendarBirthdays() {
  return useQuery({
    queryKey: ["calendar-birthdays"],
    queryFn: async () => [],
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useGoogleCalendarConnection(): UseQueryResult<
  GoogleCalendarConnectionWithStatus | null,
  Error
> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: ["google-calendar", "connection"],
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return null;
      const data = await fetchGoogleCalendarConnection(supabase, userId);
      if (!data) return null;

      const now = new Date();
      const watchExpiration = data.watch_expiration ? new Date(data.watch_expiration) : null;
      const tokenExpiration = new Date(data.token_expires_at);
      let connectionStatus: "connected" | "disconnected" | "expired" | "error" = "connected";
      if (!data.is_connected) {
        connectionStatus = "disconnected";
      } else if (tokenExpiration < now) {
        connectionStatus = "expired";
      } else if (data.last_sync_error) {
        connectionStatus = "error";
      }

      return {
        ...data,
        isWatchActive: watchExpiration ? watchExpiration > now : false,
        watchExpiresIn: watchExpiration ? watchExpiration.getTime() - now.getTime() : null,
        connectionStatus,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useHasGoogleCalendarConnection(): UseQueryResult<boolean, Error> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: ["google-calendar", "connection-status"],
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return false;
      return hasActiveGoogleCalendarConnection(supabase, userId);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGoogleSyncLogs(filters?: GoogleSyncLogFilters) {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: ["google-calendar", "sync-logs", filters],
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return [];
      return fetchGoogleSyncLogs(supabase, userId, filters);
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function useGoogleSyncStatus() {
  const supabase = createBrowserAuthClient();

  const errorCountQuery = useQuery({
    queryKey: ["google-calendar", "sync-error-count"],
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return 0;
      return fetchRecentSyncErrorCount(supabase, userId);
    },
    staleTime: 1 * 60 * 1000,
  });

  const lastSyncQuery = useQuery({
    queryKey: ["google-calendar", "last-sync"],
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return null;
      return fetchLastSyncTimestamp(supabase, userId);
    },
    staleTime: 1 * 60 * 1000,
  });

  const pendingCountQuery = useQuery({
    queryKey: ["google-calendar", "pending-sync-count"],
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return 0;
      return fetchPendingSyncCount(supabase, userId);
    },
    staleTime: 1 * 60 * 1000,
  });

  return {
    recentErrorCount: errorCountQuery.data ?? 0,
    lastSyncAt: lastSyncQuery.data,
    pendingCount: pendingCountQuery.data ?? 0,
    isPending: errorCountQuery.isPending || lastSyncQuery.isPending || pendingCountQuery.isPending,
    hasErrors: (errorCountQuery.data ?? 0) > 0,
    hasPending: (pendingCountQuery.data ?? 0) > 0,
  };
}
