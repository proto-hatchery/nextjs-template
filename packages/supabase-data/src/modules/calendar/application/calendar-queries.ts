import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  CalendarEvent,
  CalendarEventSeries,
  CalendarEventFilters,
  CalendarEventSeriesFilters,
  CalendarViewEvent,
  CalendarEventType,
  SupervisionType,
  BlockType,
} from "@workspace/supabase-data/types/entities";

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Fetches calendar events with optional filters
 */
export async function fetchCalendarEvents(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  filters?: CalendarEventFilters,
): Promise<CalendarEvent[]> {
  let query = supabase
    .from("calendar_events")
    .select(
      `
      *,
      series:calendar_event_series(
        id,
        rrule,
        effective_start,
        effective_end
      )
    `,
    )
    .eq("psychologist_id", psychologistId)
    .order("start_datetime", { ascending: true });

  // Apply filters
  if (filters?.eventType) {
    const types = Array.isArray(filters.eventType) ? filters.eventType : [filters.eventType];
    query = query.in("event_type", types);
  }

  if (filters?.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    query = query.in("status", statuses);
  }

  if (filters?.source) {
    query = query.eq("source", filters.source);
  }

  if (filters?.seriesId) {
    query = query.eq("series_id", filters.seriesId);
  }

  if (filters?.syncStatus) {
    query = query.eq("google_sync_status", filters.syncStatus);
  }

  if (filters?.startDate) {
    query = query.gte("start_datetime", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("start_datetime", filters.endDate);
  }

  if (filters?.isRecurring !== undefined) {
    if (filters.isRecurring) {
      query = query.not("series_id", "is", null);
    } else {
      query = query.is("series_id", null);
    }
  }

  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Fetches a single calendar event by ID
 */
export async function fetchCalendarEvent(
  supabase: TypedSupabaseClient,
  eventId: string,
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select(
      `
      *,
      series:calendar_event_series(
        id,
        rrule,
        effective_start,
        effective_end
      )
    `,
    )
    .eq("id", eventId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetches calendar events for the calendar view (optimized)
 * Uses the calendar_events_full view
 */
export async function fetchCalendarViewEvents(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  startDate: string,
  endDate: string,
  eventTypes?: CalendarEventType[],
): Promise<CalendarViewEvent[]> {
  let query = supabase
    .from("calendar_events_full")
    .select("*")
    .eq("psychologist_id", psychologistId)
    .gte("start_datetime", startDate)
    .lt("start_datetime", endDate)
    .not("status", "eq", "cancelled")
    .order("start_datetime", { ascending: true });

  if (eventTypes && eventTypes.length > 0) {
    query = query.in("event_type", eventTypes);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform to CalendarViewEvent
  return (data ?? []).map((event) => {
    const metadata = event.metadata as Record<string, unknown> | null;

    return {
      id: event.id!,
      seriesId: event.series_id ?? null,
      psychologistId: event.psychologist_id!,
      eventType: event.event_type as CalendarEventType,
      title: event.title!,
      description: event.description ?? null,
      startDatetime: event.start_datetime!,
      endDatetime: event.end_datetime!,
      timezone: event.timezone!,
      allDay: event.all_day ?? false,
      status: event.status!,
      source: event.source!,
      color: event.color ?? null,
      location: event.location ?? null,
      googleEventId: event.google_event_id ?? null,
      googleSyncStatus: event.google_sync_status!,
      isRecurring: !!event.series_id,
      wasRescheduled: event.status === "rescheduled",
      // Session-specific (fields from calendar_events_full view)
      patientId: event.psychologist_patient_id ?? null,
      patientName: event.patient_display_name ?? event.patient_name ?? null,
      sessionTypeName:
        (event as Database["public"]["Views"]["calendar_events_full"]["Row"]).service_name ?? null,
      // Supervision/block (from metadata)
      supervisionType: (metadata?.supervision_type as SupervisionType | undefined) ?? null,
      blockType: (metadata?.block_type as BlockType | undefined) ?? null,
    };
  });
}

/**
 * Fetches calendar events for a specific patient (sessions only)
 */
export async function fetchPatientCalendarEvents(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  patientId: string,
  filters?: Omit<CalendarEventFilters, "patientId">,
): Promise<Database["public"]["Views"]["calendar_events_full"]["Row"][]> {
  const { data, error } = await supabase
    .from("calendar_events_full")
    .select("*")
    .eq("psychologist_id", psychologistId)
    .eq("event_type", "session")
    .eq("psychologist_patient_id", patientId)
    .gte("start_datetime", filters?.startDate ?? new Date().toISOString())
    .order("start_datetime", { ascending: true })
    .limit(filters?.limit ?? 50);

  if (error) throw error;
  return data;
}

/**
 * Fetches event series with optional filters
 */
export async function fetchCalendarEventSeries(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  filters?: CalendarEventSeriesFilters,
): Promise<CalendarEventSeries[]> {
  let query = supabase
    .from("calendar_event_series")
    .select("*")
    .eq("psychologist_id", psychologistId)
    .order("created_at", { ascending: false });

  if (filters?.eventType) {
    const types = Array.isArray(filters.eventType) ? filters.eventType : [filters.eventType];
    query = query.in("event_type", types);
  }

  if (filters?.isActive !== undefined) {
    const now = new Date().toISOString().split("T")[0];
    if (filters.isActive) {
      query = query
        .lte("effective_start", now)
        .or(`effective_end.is.null,effective_end.gte.${now}`);
    } else {
      query = query.lt("effective_end", now);
    }
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Fetches a single event series by ID
 */
export async function fetchCalendarEventSeriesById(
  supabase: TypedSupabaseClient,
  seriesId: string,
): Promise<CalendarEventSeries & { events: { count: number }[]; exceptions: { count: number }[] }> {
  const { data, error } = await supabase
    .from("calendar_event_series")
    .select(
      `
      *,
      events:calendar_events!calendar_events_series_id_fkey(count),
      exceptions:calendar_event_series_exceptions!calendar_event_series_exceptions_series_id_fkey(count)
    `,
    )
    .eq("id", seriesId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Check for conflicting events in a time range
 */
export async function checkCalendarConflicts(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  startDatetime: string,
  endDatetime: string,
  excludeEventId?: string,
): Promise<Array<{ id: string; title: string; start_datetime: string; end_datetime: string }>> {
  const { data, error } = await supabase.rpc("check_calendar_conflicts", {
    p_psychologist_id: psychologistId,
    p_start_datetime: startDatetime,
    p_end_datetime: endDatetime,
    ...(excludeEventId ? { p_exclude_event_id: excludeEventId } : {}),
  });

  if (error) throw error;
  return (data ?? []).map((item) => ({
    id: item.event_id,
    title: item.title,
    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime,
  }));
}

/**
 * Gets the Google Meet link for a calendar event
 */
export async function getEventMeetLink(
  supabase: TypedSupabaseClient,
  eventId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("metadata")
    .eq("id", eventId)
    .single();

  if (error) throw error;

  const metadata = data?.metadata as Record<string, unknown> | null;
  const meetLink = metadata?.google_meet_link ?? metadata?.meet_link;
  return typeof meetLink === "string" ? meetLink : null;
}
