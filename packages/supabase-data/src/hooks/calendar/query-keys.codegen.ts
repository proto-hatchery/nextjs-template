/**
 * TanStack Query key factory for domain "calendar".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/calendar/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const calendarQueryKeys = {
  all: ["calendar"] as const,
  availabilityExceptions: () => [...calendarQueryKeys.all, "availability-exceptions"] as const,
  availabilityExceptionsList: (filters?: Record<string, unknown>) =>
    [...calendarQueryKeys.availabilityExceptions(), "list", filters ?? {}] as const,
  busySlots: () => [...calendarQueryKeys.all, "busy-slots"] as const,
  busySlotsList: (filters?: Record<string, unknown>) =>
    [...calendarQueryKeys.busySlots(), "list", filters ?? {}] as const,
  calendarChangeLog: () => [...calendarQueryKeys.all, "calendar-change-log"] as const,
  calendarChangeLogList: (filters?: Record<string, unknown>) =>
    [...calendarQueryKeys.calendarChangeLog(), "list", filters ?? {}] as const,
  calendarEventSeries: () => [...calendarQueryKeys.all, "calendar-event-series"] as const,
  calendarEventSeriesList: (filters?: Record<string, unknown>) =>
    [...calendarQueryKeys.calendarEventSeries(), "list", filters ?? {}] as const,
  calendarEventSeriesExceptions: () => [...calendarQueryKeys.all, "calendar-event-series-exceptions"] as const,
  calendarEventSeriesExceptionsList: (filters?: Record<string, unknown>) =>
    [...calendarQueryKeys.calendarEventSeriesExceptions(), "list", filters ?? {}] as const,
  calendarEvents: () => [...calendarQueryKeys.all, "calendar-events"] as const,
  calendarEventsList: (filters?: Record<string, unknown>) =>
    [...calendarQueryKeys.calendarEvents(), "list", filters ?? {}] as const,
  calendarHolidays: () => [...calendarQueryKeys.all, "calendar-holidays"] as const,
  calendarHolidaysList: (filters?: Record<string, unknown>) =>
    [...calendarQueryKeys.calendarHolidays(), "list", filters ?? {}] as const,
}
