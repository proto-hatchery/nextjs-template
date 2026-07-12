import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  CreateCalendarEventSeriesInput,
  ConvertCalendarEventToSeriesInput,
  CreateSessionSeriesInput,
  UpdateCalendarEventSeriesInput,
  CalendarEventType,
  SeriesExceptionType,
} from "@workspace/supabase-data/types/entities";
import { expandSeries } from "../../../utils/expand-series";
import { getCurrentDateInTimezone, resolvePsychologistTimezone } from "../../../utils/timezone";
import { addDays, format } from "date-fns";
import {
  bulkDeleteCalendarEvents,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "./calendar-event-commands";
import { safeLogger } from "../../../utils/safe-logger";

export type SeriesEditScope = "this" | "this_and_following" | "all";

type TypedSupabaseClient = SupabaseClient<Database>;
type CalendarEventWithSeries = Database["public"]["Tables"]["calendar_events"]["Row"] & {
  series:
    | Database["public"]["Tables"]["calendar_event_series"]["Row"]
    | Database["public"]["Tables"]["calendar_event_series"]["Row"][]
    | null;
};

async function insertCalendarEventSeriesRecord(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: CreateCalendarEventSeriesInput,
) {
  const timezone = await resolvePsychologistTimezone(supabase, psychologistId, input.timezone);
  const { data, error } = await supabase
    .from("calendar_event_series")
    .insert({
      psychologist_id: psychologistId,
      event_type: input.eventType,
      title: input.title,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      start_time: input.startTime,
      end_time: input.endTime,
      duration_minutes: input.durationMinutes ?? 50,
      timezone,
      all_day: input.allDay ?? false,
      rrule: input.rrule,
      effective_start: input.effectiveStart,
      ...(input.effectiveEnd !== undefined ? { effective_end: input.effectiveEnd } : {}),
      google_sync_status: "pending" as const,
      metadata: (input.metadata ??
        {}) as Database["public"]["Tables"]["calendar_event_series"]["Row"]["metadata"],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function insertSessionSeriesRecord(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: CreateSessionSeriesInput,
) {
  const timezone = await resolvePsychologistTimezone(supabase, psychologistId, input.timezone);
  const { data, error } = await supabase
    .from("calendar_event_series")
    .insert({
      psychologist_id: psychologistId,
      event_type: "session" as CalendarEventType,
      title: input.title,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      color: input.color ?? "#4285F4",
      start_time: input.startTime,
      end_time: input.endTime,
      duration_minutes: input.durationMinutes ?? 50,
      timezone,
      all_day: false,
      rrule: input.rrule,
      effective_start: input.effectiveStart,
      ...(input.effectiveEnd !== undefined ? { effective_end: input.effectiveEnd } : {}),
      google_sync_status: "pending",
      metadata: {
        patient_id: input.patientId,
        session_type_id: input.sessionTypeId,
        service_id: input.serviceId,
        ...(input.locationId !== undefined ? { location_id: input.locationId } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.sessionNumber !== undefined ? { session_number: input.sessionNumber } : {}),
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Creates a new calendar event series (recurring events)
 */
export async function createCalendarEventSeries(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: CreateCalendarEventSeriesInput,
) {
  const data = await insertCalendarEventSeriesRecord(supabase, psychologistId, input);

  await expandSeries(supabase, data.id, {
    fromDate: getCurrentDateInTimezone(data.timezone),
    timezone: data.timezone,
  });

  return data;
}

/**
 * Creates a recurring session series
 */
export async function createSessionSeries(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: CreateSessionSeriesInput,
) {
  const data = await insertSessionSeriesRecord(supabase, psychologistId, input);
  await expandSeries(supabase, data.id, {
    fromDate: getCurrentDateInTimezone(data.timezone),
    timezone: data.timezone,
  });
  return data;
}

export async function convertCalendarEventToSeries(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: ConvertCalendarEventToSeriesInput,
) {
  const { data: existingEvent, error: existingEventError } = await supabase
    .from("calendar_events")
    .select(
      "id, psychologist_id, title, description, location, color, start_datetime, end_datetime, duration_minutes, timezone, all_day, metadata, original_start_datetime, original_end_datetime",
    )
    .eq("id", input.eventId)
    .single();

  if (existingEventError) throw existingEventError;

  if (existingEvent.psychologist_id !== psychologistId) {
    throw new Error("Event does not belong to the current psychologist");
  }

  let series;
  if (input.eventType === "session") {
    series = await insertSessionSeriesRecord(supabase, psychologistId, {
      title: input.title,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      startTime: input.startTime,
      endTime: input.endTime,
      ...(input.durationMinutes !== undefined ? { durationMinutes: input.durationMinutes } : {}),
      ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
      rrule: input.rrule,
      effectiveStart: input.effectiveStart,
      ...(input.effectiveEnd !== undefined ? { effectiveEnd: input.effectiveEnd } : {}),
      patientId: input.patientId,
      ...(input.sessionTypeId !== undefined ? { sessionTypeId: input.sessionTypeId } : {}),
      ...(input.serviceId !== undefined ? { serviceId: input.serviceId } : {}),
      ...(input.locationId !== undefined ? { locationId: input.locationId } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.sessionNumber !== undefined ? { sessionNumber: input.sessionNumber } : {}),
    });
  } else {
    series = await insertCalendarEventSeriesRecord(supabase, psychologistId, input);
  }

  const updateData: Database["public"]["Tables"]["calendar_events"]["Update"] = {
    title: input.title,
    description: input.description ?? null,
    location: input.location ?? null,
    color: input.color ?? existingEvent.color,
    start_datetime: input.startDatetime,
    end_datetime: input.endDatetime,
    duration_minutes: input.durationMinutes ?? existingEvent.duration_minutes,
    timezone: series.timezone,
    all_day: input.eventType === "session" ? false : (input.allDay ?? existingEvent.all_day),
    series_id: series.id,
    original_start_datetime: existingEvent.original_start_datetime ?? existingEvent.start_datetime,
    original_end_datetime: existingEvent.original_end_datetime ?? existingEvent.end_datetime,
    updated_at: new Date().toISOString(),
    sync_origin: "user",
    google_sync_status: "pending",
  };

  if (input.metadata !== undefined) {
    updateData.metadata =
      input.metadata as Database["public"]["Tables"]["calendar_events"]["Row"]["metadata"];
  }

  const { error: updateError } = await supabase
    .from("calendar_events")
    .update(updateData)
    .eq("id", input.eventId);

  if (updateError) throw updateError;

  const effectiveStartDate = new Date(`${input.effectiveStart}T00:00:00`);
  const nextExpansionStart = format(addDays(effectiveStartDate, 1), "yyyy-MM-dd");

  await expandSeries(supabase, series.id, {
    fromDate: nextExpansionStart,
    timezone: series.timezone,
  });

  return series;
}

/**
 * Updates a calendar event series
 */
export async function updateCalendarEventSeries(
  supabase: TypedSupabaseClient,
  seriesId: string,
  input: UpdateCalendarEventSeriesInput,
) {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    google_sync_status: "pending",
  };

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.color !== undefined) updateData.color = input.color;
  if (input.startTime !== undefined) updateData.start_time = input.startTime;
  if (input.endTime !== undefined) updateData.end_time = input.endTime;
  if (input.durationMinutes !== undefined) updateData.duration_minutes = input.durationMinutes;
  if (input.allDay !== undefined) updateData.all_day = input.allDay;
  if (input.timezone !== undefined) updateData.timezone = input.timezone;
  if (input.rrule !== undefined) updateData.rrule = input.rrule;
  if (input.effectiveEnd !== undefined) updateData.effective_end = input.effectiveEnd;
  if (input.metadata !== undefined) updateData.metadata = input.metadata;

  const { data, error } = await supabase
    .from("calendar_event_series")
    .update(updateData)
    .eq("id", seriesId)
    .select()
    .single();

  if (error) throw error;

  // 1.3 RECONCILIATION: Re-expand instances
  try {
    const nowUtc = new Date().toISOString();
    const fromDate = getCurrentDateInTimezone(data.timezone);

    if (data.event_type === "session") {
      // Session instances must be removed via the session-aware event delete path
      // to avoid orphaning clinical_sessions/charges/notes.
      const { data: futureEvents, error: futureEventsError } = await supabase
        .from("calendar_events")
        .select("id")
        .eq("series_id", seriesId)
        .gte("start_datetime", nowUtc);

      if (futureEventsError) {
        throw futureEventsError;
      }

      const eventIds = (futureEvents ?? []).map((e) => e.id);
      if (eventIds.length > 0) {
        await bulkDeleteCalendarEvents(supabase, eventIds);
      }
    } else {
      // Delete future instances that are not exceptions
      // Note: We delete all future instances and let expand-series recreate them
      // expand-series handles exceptions via calendar_event_series_exceptions table
      await supabase
        .from("calendar_events")
        .delete()
        .eq("series_id", seriesId)
        .gte("start_datetime", nowUtc);
    }

    // Re-expand future instances via the centralized helper (handles auth headers consistently)
    await expandSeries(supabase, seriesId, { fromDate, timezone: data.timezone });
  } catch (err) {
    safeLogger.error("[updateCalendarEventSeries] Reconciliation failed:", err);
    // Don't fail the update, but log error
  }

  return data;
}

/**
 * Ends a series (sets effective_end to today)
 */
export async function endCalendarEventSeries(
  supabase: TypedSupabaseClient,
  seriesId: string,
  endDate?: string,
) {
  let effectiveEnd = endDate;
  if (!effectiveEnd) {
    const { data: series } = await supabase
      .from("calendar_event_series")
      .select("timezone")
      .eq("id", seriesId)
      .maybeSingle();
    effectiveEnd = getCurrentDateInTimezone(series?.timezone);
  }

  const { data, error } = await supabase
    .from("calendar_event_series")
    .update({
      effective_end: effectiveEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("id", seriesId)
    .select()
    .single();

  if (error) throw error;

  // Optionally: cancel future events in the series
  await supabase
    .from("calendar_events")
    .update({ status: "cancelled" })
    .eq("series_id", seriesId)
    .gte("start_datetime", new Date().toISOString());

  return data;
}

/**
 * Deletes a calendar event series and all its events
 */
export async function deleteCalendarEventSeries(supabase: TypedSupabaseClient, seriesId: string) {
  // 1. Fetch events with google_event_id to sync deletion
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, event_type, google_event_id, psychologist_id")
    .eq("series_id", seriesId);

  // 2. For session series events, use session-aware delete path first.
  const sessionEventIds = (events ?? [])
    .filter((event) => event.event_type === "session")
    .map((event) => event.id);

  const preservableSessionEventIds: string[] = [];

  if (sessionEventIds.length > 0) {
    const { data: sessionRows, error: sessionRowsError } = await supabase
      .from("calendar_events")
      .select("id, status")
      .in("id", sessionEventIds)
      .eq("event_type", "session");

    if (sessionRowsError) {
      throw sessionRowsError;
    }

    const statusByEventId = new Map<string, string | null>();
    for (const row of sessionRows ?? []) {
      statusByEventId.set(row.id, row.status);
    }

    for (const eventId of sessionEventIds) {
      const sessionStatus = statusByEventId.get(eventId) ?? null;

      if (sessionStatus === "scheduled" || sessionStatus === "cancelled") {
        await deleteCalendarEvent(supabase, eventId);
      } else {
        // Keep historical/non-deletable session events; detach from series
        preservableSessionEventIds.push(eventId);
      }
    }
  }

  if (preservableSessionEventIds.length > 0) {
    const { error: detachError } = await supabase
      .from("calendar_events")
      .update({ series_id: null, updated_at: new Date().toISOString() })
      .in("id", preservableSessionEventIds);

    if (detachError) {
      throw detachError;
    }
  }

  // 2. Delete series (events are deleted via cascade in DB)
  const { error } = await supabase.from("calendar_event_series").delete().eq("id", seriesId);

  if (error) throw error;

  // Google deletions are now queued by DB trigger on calendar_events DELETE.
}

/**
 * Creates an exception for a series occurrence
 */
export async function createSeriesException(
  supabase: TypedSupabaseClient,
  seriesId: string,
  originalDate: string,
  exceptionType: SeriesExceptionType,
  options?: {
    newStartDatetime?: string;
    newEndDatetime?: string;
    modifiedFields?: Record<string, unknown>;
    reason?: string;
  },
) {
  const { data, error } = await supabase
    .from("calendar_event_series_exceptions")
    .insert({
      series_id: seriesId,
      original_date: originalDate,
      exception_type: exceptionType,
      ...(options?.newStartDatetime !== undefined
        ? { new_start_datetime: options.newStartDatetime }
        : {}),
      ...(options?.newEndDatetime !== undefined
        ? { new_end_datetime: options.newEndDatetime }
        : {}),
      ...(options?.modifiedFields !== undefined
        ? {
            modified_fields:
              options.modifiedFields as Database["public"]["Tables"]["calendar_event_series_exceptions"]["Row"]["modified_fields"],
          }
        : {}),
      ...(options?.reason !== undefined ? { reason: options.reason } : {}),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Removes an exception (restores the original occurrence)
 */
export async function removeSeriesException(
  supabase: TypedSupabaseClient,
  seriesId: string,
  originalDate: string,
) {
  const { error } = await supabase
    .from("calendar_event_series_exceptions")
    .delete()
    .eq("series_id", seriesId)
    .eq("original_date", originalDate);

  if (error) throw error;
}

/**
 * Updates a series instance based on the edit scope (this, this_and_following, all)
 */
export async function updateSeriesInstance(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  eventId: string,
  updates: UpdateCalendarEventSeriesInput & { timezone?: string; allDay?: boolean },
  scope: SeriesEditScope,
) {
  // 1. Fetch current event to get context
  const { data: event, error: eventError } = await supabase
    .from("calendar_events")
    .select("*, series:series_id(*)")
    .eq("id", eventId)
    .single();

  const eventWithSeries: CalendarEventWithSeries | null = event;
  if (eventError || !eventWithSeries || !eventWithSeries.series) {
    throw new Error("Event or series not found");
  }

  const originalDateString = eventWithSeries.original_start_datetime
    ? eventWithSeries.original_start_datetime.split("T")[0]
    : eventWithSeries.start_datetime.split("T")[0];

  switch (scope) {
    case "this": {
      // Create exception
      await createSeriesException(
        supabase,
        eventWithSeries.series_id!,
        originalDateString!,
        "modified",
        {
          modifiedFields: updates as Record<string, unknown>,
          reason: "User updated specific instance",
        },
      );

      // Update the actual event instance
      // Map series input to event input
      const eventUpdates: Record<string, unknown> = {};
      if (updates.title) eventUpdates.title = updates.title;
      if (updates.description) eventUpdates.description = updates.description;
      if (updates.location) eventUpdates.location = updates.location;
      if (updates.color) eventUpdates.color = updates.color;

      await updateCalendarEvent(supabase, eventId, eventUpdates);
      break;
    }

    case "this_and_following": {
      const splitDate = new Date(originalDateString + "T00:00:00");
      const dayBefore = addDays(splitDate, -1);

      // 1. End current series yesterday
      await endCalendarEventSeries(
        supabase,
        eventWithSeries.series_id!,
        format(dayBefore, "yyyy-MM-dd"),
      );

      // 2. Create new series starting today
      // Merge old series data with updates
      const oldSeries = Array.isArray(eventWithSeries.series)
        ? eventWithSeries.series[0]
        : eventWithSeries.series;
      if (!oldSeries) {
        throw new Error("Series data not found for event");
      }

      // Use updates if provided, otherwise fall back to old series data
      await createCalendarEventSeries(supabase, psychologistId, {
        eventType: oldSeries.event_type as CalendarEventType,
        title: (updates.title ?? oldSeries.title) || "", // Handle null/undefined by defaulting to empty string if needed, or undefined if optional
        ...((updates.description ?? oldSeries.description)
          ? { description: (updates.description ?? oldSeries.description) || "" }
          : {}),
        ...((updates.location ?? oldSeries.location)
          ? { location: (updates.location ?? oldSeries.location) || "" }
          : {}),
        color: (updates.color ?? oldSeries.color) || "#4285F4",
        startTime: updates.startTime ?? oldSeries.start_time,
        endTime: updates.endTime ?? oldSeries.end_time,
        durationMinutes: updates.durationMinutes ?? oldSeries.duration_minutes,
        timezone: (updates.timezone ?? oldSeries.timezone) || "UTC",
        allDay: updates.allDay ?? oldSeries.all_day,
        rrule: updates.rrule ?? oldSeries.rrule,
        effectiveStart: format(splitDate, "yyyy-MM-dd"), // Start new series today
        ...((updates.effectiveEnd ?? oldSeries.effective_end)
          ? { effectiveEnd: (updates.effectiveEnd ?? oldSeries.effective_end) || "" }
          : {}),
        metadata: (updates.metadata ?? oldSeries.metadata) as Record<string, unknown>,
      });
      break;
    }

    case "all": {
      await updateCalendarEventSeries(supabase, eventWithSeries.series_id!, updates);
      break;
    }
  }
}
