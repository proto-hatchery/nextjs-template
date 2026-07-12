import type { CalendarEvent } from "@/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/types";
import type { CalendarEventStatus, CalendarHoliday } from "@workspace/supabase-data/types/entities";
import type { Database } from "@workspace/supabase-infra/types/database";
import { utcIsoToWallClockDate } from "@workspace/ui/lib/timezone-datetime";
import { endOfDay } from "date-fns";

import {
  CALENDAR_SOURCES,
  type CalendarEventType,
  type CalendarSourceId,
  EVENT_TYPE_TO_CALENDAR_ID,
} from "../_domain/constants";

type Json = Database["public"]["Tables"]["calendar_events"]["Row"]["metadata"];

export interface DbCalendarEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean | null;
  color: string | null;
  event_type: CalendarEventType;
  series_id: string | null;
  duration_minutes: number | null;
  status: CalendarEventStatus | null;
  metadata: Json;
  series?: {
    id: string;
    rrule: string | null;
    effective_start?: string | null;
    effective_end?: string | null;
  } | null;
  notes?: string | null;
  location_id?: string | null;
  psychologist_service_id?: string | null;
  session_number?: number | null;
  snapshot_price_cents?: number | null;
}

type CalendarUiStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | undefined;
type CalendarUiMetadata = Record<string, unknown> | undefined;

function getMetadataObject(metadata: Json): Record<string, unknown> {
  return metadata !== null && typeof metadata === "object" && !Array.isArray(metadata)
    ? metadata
    : {};
}

export type CalendarUiEvent = CalendarEvent & {
  event_type: CalendarEventType;
  series_id: string | null;
  recurrence_rule: string | null;
  duration_minutes: number | undefined;
  status: CalendarUiStatus;
  metadata: CalendarUiMetadata;
};

const allowedEventColors = new Set<NonNullable<CalendarEvent["color"]>>([
  "sky",
  "amber",
  "violet",
  "rose",
  "emerald",
  "orange",
  "indigo",
]);

const initialCalendarColorById: Record<string, CalendarEvent["color"]> = {};

const calendarColorById: Record<string, CalendarEvent["color"]> = CALENDAR_SOURCES.reduce(
  (acc, source) => {
    if (source.color) {
      acc[source.id] = source.color;
    }
    return acc;
  },
  initialCalendarColorById,
);

const getEventColor = (
  eventType: CalendarEventType,
  color?: string | null,
): NonNullable<CalendarEvent["color"]> => {
  if (color && typeof color === "string") {
    const colorValue = color as NonNullable<CalendarEvent["color"]>;
    if (allowedEventColors.has(colorValue)) {
      return colorValue;
    }
  }

  const calendarId: CalendarSourceId = EVENT_TYPE_TO_CALENDAR_ID[eventType];
  const fallbackColor: NonNullable<CalendarEvent["color"]> = calendarColorById[calendarId] ?? "sky";
  return fallbackColor;
};

function toWallClockDate(utcIso: string, timezone: string): Date {
  try {
    return utcIsoToWallClockDate(utcIso, timezone);
  } catch {
    return new Date(utcIso);
  }
}

function toUtcDatePart(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso.slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}

function parseAllDayBounds(startIso: string, endIso: string): { start: Date; end: Date } {
  const startDatePart = toUtcDatePart(startIso);
  const endDatePartExclusive = toUtcDatePart(endIso);

  const start = new Date(`${startDatePart}T00:00:00`);
  const endExclusive = new Date(`${endDatePartExclusive}T00:00:00`);
  const end = new Date(endExclusive.getTime() - 1000);

  if (Number.isNaN(start.getTime())) {
    return { end: new Date(endIso), start: new Date(startIso) };
  }

  if (Number.isNaN(end.getTime()) || end < start) {
    return { end: endOfDay(start), start };
  }

  return { end, start };
}

export function mapDbEventsToUiEvents(
  dbEvents: DbCalendarEvent[],
  timezone?: string,
): CalendarUiEvent[] {
  const resolvedTimezone = typeof timezone === "string" && timezone.length > 0 ? timezone : "UTC";

  return dbEvents.map((event) => {
    const eventType: CalendarEventType = event.event_type;
    const eventMetadata = getMetadataObject(event.metadata);
    const sessionMetadata: CalendarUiMetadata = {
      ...eventMetadata,
      ...(event.notes ? { notes: event.notes } : {}),
      ...(event.location_id ? { location_id: event.location_id } : {}),
      ...(event.psychologist_service_id ? { service_id: event.psychologist_service_id } : {}),
      ...(event.session_number !== null && event.session_number !== undefined
        ? { session_number: event.session_number }
        : {}),
      ...(event.snapshot_price_cents !== null && event.snapshot_price_cents !== undefined
        ? { price: event.snapshot_price_cents }
        : {}),
    };
    const mergedMetadata: CalendarUiMetadata =
      eventType === "session" ? sessionMetadata : eventMetadata;

    // Map status to valid UI status
    let status: CalendarUiStatus;
    if (
      event.status === "scheduled" ||
      event.status === "confirmed" ||
      event.status === "completed" ||
      event.status === "cancelled"
    ) {
      status = event.status;
    } else {
      status = undefined; // Map unmapped statuses like "rescheduled", "in_progress", "no_show" to undefined
    }

    const isAllDay = event.all_day ?? false;
    const allDayBounds = isAllDay
      ? parseAllDayBounds(event.start_datetime, event.end_datetime)
      : null;

    const description = event.description ?? event.notes ?? undefined;
    const uiEvent: CalendarUiEvent = {
      id: event.id,
      title: event.title,
      ...(description !== undefined && description !== null ? { description } : {}),
      ...(event.location && { location: event.location }),
      start: allDayBounds?.start ?? toWallClockDate(event.start_datetime, resolvedTimezone),
      end: allDayBounds?.end ?? toWallClockDate(event.end_datetime, resolvedTimezone),
      allDay: isAllDay,
      color: getEventColor(event.event_type, event.color),
      calendarId: EVENT_TYPE_TO_CALENDAR_ID[event.event_type],
      event_type: eventType,
      series_id: event.series_id,
      recurrence_rule: event.series?.rrule ?? null,
      duration_minutes: event.duration_minutes ?? undefined,
      status,
      metadata: mergedMetadata,
    };

    return uiEvent;
  });
}

export function getDurationMinutes(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

export function mapDbHolidaysToUiEvents(
  dbHolidays: CalendarHoliday[],
  _timezone?: string,
): CalendarUiEvent[] {
  return dbHolidays.map((holiday) => {
    const start = new Date(`${holiday.date}T00:00:00`);
    const end = new Date(`${holiday.date}T23:59:59`);

    return {
      id: `holiday-${holiday.id}`,
      title: holiday.name,
      description: holiday.description ?? holiday.type ?? "Feriado",
      location: holiday.city ?? holiday.state ?? "Brasil",
      start,
      end,
      allDay: true,
      color: "indigo",
      calendarId: "holidays",
      event_type: "other",
      series_id: null,
      recurrence_rule: null,
      duration_minutes: undefined,
      status: "confirmed",
      editable: false,
      deletable: false,
      metadata: {
        holiday_type: holiday.type,
        state: holiday.state,
        city: holiday.city,
      },
    };
  });
}
