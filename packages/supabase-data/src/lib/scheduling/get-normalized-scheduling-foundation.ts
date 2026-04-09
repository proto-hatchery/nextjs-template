import "server-only"

import {
  listAvailabilityExceptionsAction,
} from "@workspace/supabase-data/actions/calendar/availability-exceptions-list.codegen"
import {
  listBusySlotsAction,
} from "@workspace/supabase-data/actions/calendar/busy-slots-list.codegen"
import {
  listCalendarEventSeriesAction,
} from "@workspace/supabase-data/actions/calendar/calendar-event-series-list.codegen"
import {
  listCalendarEventsAction,
} from "@workspace/supabase-data/actions/calendar/calendar-events-list.codegen"
import {
  listTherapeuticSessionEventsAction,
} from "@workspace/supabase-data/actions/clinical-sessions/therapeutic-session-events-list.codegen"
import {
  listGoogleCalendarConnectionsAction,
} from "@workspace/supabase-data/actions/google-calendar/google-calendar-connections-list.codegen"
import type { AvailabilityExceptionsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/availability-exceptions.dto.codegen"
import type { BusySlotsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/busy-slots.dto.codegen"
import type { CalendarEventSeriesDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-event-series.dto.codegen"
import type { CalendarEventsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-events.dto.codegen"
import type { TherapeuticSessionEventsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/therapeutic-session-events.dto.codegen"
import type { GoogleCalendarConnectionsDTO } from "@workspace/supabase-data/modules/google-calendar/domain/dto/google-calendar-connections.dto.codegen"

export type NormalizedScheduledItemKind =
  | "clinical-session"
  | "meeting"
  | "supervision"
  | "block"
  | "other"

export type NormalizedScheduledItem = {
  id: string
  kind: NormalizedScheduledItemKind
  title: string
  startsAt: string | null
  endsAt: string | null
  durationMinutes: number | null
  timezone: string | null
  allDay: boolean
  temporalSource: "calendar_events"
  workflowSource: "clinical_session_details" | null
  calendarEventId: string
  clinicalSessionId: string | null
  seriesId: string | null
  status: string | null
  patientId: string | null
  patientName: string | null
  serviceId: string | null
  serviceName: string | null
  location: string | null
  billingStatus: string | null
  googleSyncStatus: string | null
  googleEventId: string | null
  source: string | null
}

export type NormalizedAvailabilityException = {
  id: string
  date: string | null
  startTime: string | null
  endTime: string | null
  isAvailable: boolean | null
  reason: string | null
}

export type NormalizedBusySlot = {
  id: string
  title: string
  sourceType: string | null
  sourceId: string | null
  eventType: string | null
  isHardBlock: boolean | null
  slotRange: string | null
}

export type NormalizedCalendarSeries = {
  id: string
  title: string
  eventType: string | null
  rrule: string | null
  effectiveStart: string | null
  effectiveEnd: string | null
  timezone: string | null
  googleSyncStatus: string | null
}

export type NormalizedGoogleCalendarConnection = {
  id: string
  isConnected: boolean
  syncEnabled: boolean
  syncSessions: boolean
  syncToGoogle: boolean
  syncFromGoogle: boolean
  googleEmail: string | null
  lastSuccessfulSyncAt: string | null
  syncState: string | null
  lastSyncError: string | null
}

export type NormalizedSchedulingFoundation = {
  ownership: {
    temporalSource: string
    workflowSource: string
    availabilitySource: string
    recurrenceSource: string
    syncSource: string
  }
  compatibility: {
    scheduledItemsCount: number
    sessionItemsCount: number
    externalItemsCount: number
    availabilityExceptionsCount: number
    busySlotsCount: number
    recurringSeriesCount: number
    connectedCalendarsCount: number
  }
  scheduledItems: NormalizedScheduledItem[]
  availabilityExceptions: NormalizedAvailabilityException[]
  busySlots: NormalizedBusySlot[]
  recurringSeries: NormalizedCalendarSeries[]
  googleConnections: NormalizedGoogleCalendarConnection[]
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : null
}

function getTimestamp(value: string | null) {
  if (!value) {
    return 0
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

function normalizeKind(event: CalendarEventsDTO): NormalizedScheduledItemKind {
  const rawType = asString(event.eventType)?.toLowerCase()

  if (rawType === "session") {
    return "clinical-session"
  }

  if (rawType === "meeting") {
    return "meeting"
  }

  if (rawType === "supervision") {
    return "supervision"
  }

  if (rawType === "block") {
    return "block"
  }

  return "other"
}

function isSessionEvent(event: CalendarEventsDTO) {
  return asString(event.eventType)?.toLowerCase() === "session"
}
function mapScheduledItem(event: CalendarEventsDTO): NormalizedScheduledItem {
  const calendarEventId = String(event.id)

  return {
    id: calendarEventId,
    kind: normalizeKind(event),
    title:
      asString(event.title) ??
      asString(event.serviceName) ??
      "Untitled scheduled item",
    startsAt: asString(event.startDatetime),
    endsAt: asString(event.endDatetime),
    durationMinutes: asNumber(event.durationMinutes),
    timezone: asString(event.timezone),
    allDay: asBoolean(event.allDay) === true,
    temporalSource: "calendar_events",
    workflowSource: null,
    calendarEventId,
    clinicalSessionId: asString(event.clinicalSessionId),
    seriesId: asString(event.seriesId),
    status: asString(event.status),
    patientId: asString(event.psychologistPatientId),
    patientName: asString(event.patientDisplayName) ?? asString(event.patientName),
    serviceId: asString(event.psychologistServiceId),
    serviceName: asString(event.serviceName),
    location: asString(event.location),
    billingStatus: asString(event.billingStatus),
    googleSyncStatus: asString(event.googleSyncStatus),
    googleEventId: asString(event.googleEventId),
    source: asString(event.source),
  }
}

function mapTherapeuticSessionScheduledItem(
  event: TherapeuticSessionEventsDTO
): NormalizedScheduledItem {
  return {
    id: String(event.calendarEventId),
    kind: "clinical-session",
    title:
      asString(event.title) ??
      asString(event.serviceName) ??
      (asNumber(event.sessionNumber) ? `Clinical session ${asNumber(event.sessionNumber)}` : null) ??
      "Clinical session",
    startsAt: asString(event.startDatetime),
    endsAt: asString(event.endDatetime),
    durationMinutes: asNumber(event.durationMinutes),
    timezone: asString(event.timezone),
    allDay: asBoolean(event.allDay) === true,
    temporalSource: "calendar_events",
    workflowSource: "clinical_session_details",
    calendarEventId: String(event.calendarEventId),
    clinicalSessionId: asString(event.clinicalSessionId),
    seriesId: asString(event.seriesId),
    status: asString(event.schedulingStatus),
    patientId: asString(event.psychologistPatientId),
    patientName: asString(event.patientDisplayName) ?? asString(event.patientName),
    serviceId: asString(event.psychologistServiceId),
    serviceName: asString(event.serviceName),
    location: asString(event.location),
    billingStatus: asString(event.billingStatus),
    googleSyncStatus: asString(event.googleSyncStatus),
    googleEventId: asString(event.googleEventId),
    source: asString(event.source),
  }
}

function mapAvailabilityException(
  exception: AvailabilityExceptionsDTO
): NormalizedAvailabilityException {
  return {
    id: String(exception.id),
    date: asString(exception.exceptionDate),
    startTime: asString(exception.startTime),
    endTime: asString(exception.endTime),
    isAvailable: asBoolean(exception.isAvailable),
    reason: asString(exception.reason),
  }
}

function mapBusySlot(slot: BusySlotsDTO): NormalizedBusySlot {
  return {
    id: String(slot.id),
    title: asString(slot.title) ?? "Busy slot",
    sourceType: asString(slot.sourceType),
    sourceId: asString(slot.sourceId),
    eventType: asString(slot.eventType),
    isHardBlock: asBoolean(slot.isHardBlock),
    slotRange: asString(slot.slotRange),
  }
}

function mapSeries(series: CalendarEventSeriesDTO): NormalizedCalendarSeries {
  return {
    id: String(series.id),
    title: asString(series.title) ?? "Recurring series",
    eventType: asString(series.eventType),
    rrule: asString(series.rrule),
    effectiveStart: asString(series.effectiveStart),
    effectiveEnd: asString(series.effectiveEnd),
    timezone: asString(series.timezone),
    googleSyncStatus: asString(series.googleSyncStatus),
  }
}

function mapGoogleConnection(
  connection: GoogleCalendarConnectionsDTO
): NormalizedGoogleCalendarConnection {
  return {
    id: String(connection.id),
    isConnected: asBoolean(connection.isConnected) === true,
    syncEnabled: asBoolean(connection.syncEnabled) === true,
    syncSessions: asBoolean(connection.syncSessions) === true,
    syncToGoogle: asBoolean(connection.syncToGoogle) === true,
    syncFromGoogle: asBoolean(connection.syncFromGoogle) === true,
    googleEmail: asString(connection.googleEmail),
    lastSuccessfulSyncAt: asString(connection.lastSuccessfulSyncAt),
    syncState: asString(connection.syncState),
    lastSyncError: asString(connection.lastSyncError),
  }
}

export async function getNormalizedSchedulingFoundation(): Promise<NormalizedSchedulingFoundation> {
  const [
    calendarEventsResult,
    therapeuticSessionEventsResult,
    availabilityExceptionsResult,
    busySlotsResult,
    calendarSeriesResult,
    googleConnectionsResult,
  ] = await Promise.all([
    listCalendarEventsAction({ limit: 100, offset: 0 }),
    listTherapeuticSessionEventsAction({ limit: 100, offset: 0 }),
    listAvailabilityExceptionsAction({ limit: 100, offset: 0 }),
    listBusySlotsAction({ limit: 100, offset: 0 }),
    listCalendarEventSeriesAction({ limit: 100, offset: 0 }),
    listGoogleCalendarConnectionsAction({ limit: 25, offset: 0 }),
  ])

  const genericScheduledItems = calendarEventsResult.rows
    .filter((event) => !isSessionEvent(event))
    .map(mapScheduledItem)
  const therapeuticSessionItems = therapeuticSessionEventsResult.rows.map(
    mapTherapeuticSessionScheduledItem
  )
  const scheduledItems = [...genericScheduledItems, ...therapeuticSessionItems].sort(
    (left, right) => getTimestamp(left.startsAt) - getTimestamp(right.startsAt)
  )

  const availabilityExceptions = availabilityExceptionsResult.rows
    .map(mapAvailabilityException)
    .sort((left, right) => getTimestamp(left.date) - getTimestamp(right.date))

  const busySlots = busySlotsResult.rows.map(mapBusySlot)
  const recurringSeries = calendarSeriesResult.rows.map(mapSeries)
  const googleConnections = googleConnectionsResult.rows.map(mapGoogleConnection)

  return {
    ownership: {
      temporalSource: "calendar_events currently owns calendar-facing time, duration, recurrence linkage, and sync metadata.",
      workflowSource: "clinical_session_details and therapeutic_session_events now carry the session workflow read model.",
      availabilitySource: "availability_exceptions and busy_slots represent availability overlays and hard blocks rather than primary scheduled events.",
      recurrenceSource: "calendar_event_series owns recurring rule definitions for calendar-native repeated events.",
      syncSource: "google_calendar_connections owns external calendar connection and sync state.",
    },
    compatibility: {
      scheduledItemsCount: scheduledItems.length,
      sessionItemsCount: scheduledItems.filter((item) => item.kind === "clinical-session").length,
      externalItemsCount: scheduledItems.filter((item) => item.kind !== "clinical-session").length,
      availabilityExceptionsCount: availabilityExceptions.length,
      busySlotsCount: busySlots.length,
      recurringSeriesCount: recurringSeries.length,
      connectedCalendarsCount: googleConnections.filter((connection) => connection.isConnected).length,
    },
    scheduledItems,
    availabilityExceptions,
    busySlots,
    recurringSeries,
    googleConnections,
  }
}
