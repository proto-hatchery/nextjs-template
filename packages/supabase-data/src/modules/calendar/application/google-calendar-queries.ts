import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { GoogleSyncLogFilters } from "@workspace/supabase-data/types/entities";

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Fetches the Google Calendar connection for a psychologist
 */
export async function fetchGoogleCalendarConnection(
  supabase: TypedSupabaseClient,
  psychologistId: string,
) {
  const { data, error } = await supabase
    .from("google_calendar_connections")
    .select("*")
    .eq("psychologist_id", psychologistId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data;
}

/**
 * Checks if a psychologist has an active Google Calendar connection
 */
export async function hasActiveGoogleCalendarConnection(
  supabase: TypedSupabaseClient,
  psychologistId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("google_calendar_connections")
    .select("id, is_connected")
    .eq("psychologist_id", psychologistId)
    .eq("is_connected", true)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Fetches Google sync logs for a psychologist
 */
export async function fetchGoogleSyncLogs(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  filters?: GoogleSyncLogFilters,
) {
  let query = supabase
    .from("google_sync_logs")
    .select(
      `
      *,
      event:calendar_events(
        id,
        title,
        start_datetime,
        event_type
      )
    `,
    )
    .eq("psychologist_id", psychologistId)
    .order("created_at", { ascending: false });

  if (filters?.direction) {
    query = query.eq("sync_direction", filters.direction);
  }

  if (filters?.operation) {
    query = query.eq("operation", filters.operation);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.eventId) {
    query = query.eq("calendar_event_id", filters.eventId);
  }

  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Fetches the count of recent sync errors (last 24 hours)
 */
export async function fetchRecentSyncErrorCount(
  supabase: TypedSupabaseClient,
  psychologistId: string,
): Promise<number> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { count, error } = await supabase
    .from("google_sync_logs")
    .select("id", { count: "exact", head: true })
    .eq("psychologist_id", psychologistId)
    .eq("status", "error")
    .gte("created_at", yesterday.toISOString());

  if (error) throw error;
  return count ?? 0;
}

/**
 * Fetches the timestamp of the last successful sync
 */
export async function fetchLastSyncTimestamp(
  supabase: TypedSupabaseClient,
  psychologistId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("google_sync_logs")
    .select("completed_at")
    .eq("psychologist_id", psychologistId)
    .eq("status", "success")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.completed_at ?? null;
}

/**
 * Fetches the count of events pending sync
 */
export async function fetchPendingSyncCount(
  supabase: TypedSupabaseClient,
  psychologistId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("calendar_events")
    .select("id", { count: "exact", head: true })
    .eq("psychologist_id", psychologistId)
    .eq("google_sync_status", "pending");

  if (error) throw error;
  return count ?? 0;
}
