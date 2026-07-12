import type { EventCreationFormValues } from "@/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/event-creation-modal";
import type {
  CalendarEventFull,
  SeriesEditScope,
} from "@/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/event-quick-view-popover";
import type { CalendarEvent } from "@/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/types";
import { convertEventToSeriesAction } from "@workspace/supabase-data/actions/calendar/convert-event-to-series";
import { createCalendarEventAction } from "@workspace/supabase-data/actions/calendar/create-calendar-event";
import { deleteEventAction } from "@workspace/supabase-data/actions/calendar/delete-event";
import { deleteSeriesAction } from "@workspace/supabase-data/actions/calendar/delete-series";
import { updateEventAction } from "@workspace/supabase-data/actions/calendar/update-event";
import { updateSeriesInstanceAction } from "@workspace/supabase-data/actions/calendar/update-series-instance";
import { getEventMeetLinkAction } from "@workspace/supabase-data/actions/sessions/get-event-meet-link";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import type { UpdateCalendarEventSeriesInput } from "@workspace/supabase-data/types/entities";
import { usePsychologistLocations } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import {
  useCalendarBirthdays,
  useCalendarEvents,
  useCalendarHolidays,
  useGoogleCalendarConnection,
} from "@workspace/supabase-data/hooks/queries";
import { usePsychologistClinicalSessions } from "@workspace/supabase-data/hooks/sessions";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import type { CalendarSourceId } from "../_domain/constants";
import { CALENDAR_ID_TO_EVENT_TYPE, CALENDAR_SOURCES } from "../_domain/constants";
import { buildSessionEditOverrides } from "../_utils/build-session-edit-overrides";
import {
  combineDateAndTime,
  getCreateEventErrorMessage,
  validateEventData,
} from "../_utils/event-creation-utils";
import {
  type CalendarUiEvent,
  type DbCalendarEvent,
  getDurationMinutes,
  mapDbEventsToUiEvents,
  mapDbHolidaysToUiEvents,
} from "../_utils/event-mappers";
import { syncGoogleCalendar } from "../_utils/google-calendar-sync";
import {
  nowInTimezone,
  wallClockDateToUtcIso,
  wallClockDateToYmd,
} from "../_utils/timezone-datetime";
import { useGoogleCalendarConnectionFeedback } from "./use-google-calendar-connection-feedback";
import { useSpaceEventCreation } from "./use-space-event-creation";

function isCalendarSourceId(value: string): value is CalendarSourceId {
  return value in CALENDAR_ID_TO_EVENT_TYPE;
}

function mapCalendarSourceToEventType(
  sourceId: CalendarSourceId,
): "session" | "supervision" | "meeting" | "block" | "other" {
  if (sourceId === "sessions") return "session";
  if (sourceId === "supervision") return "supervision";
  if (sourceId === "meetings" || sourceId === "birthdays") return "meeting";
  if (sourceId === "blocks") return "block";
  return "other";
}

function getNonEmptyStringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function resolveEventDateRange(
  date: Date,
  startTime: string,
  endTime: string,
  allDay?: boolean,
): { start: Date | null; end: Date | null; durationMinutes: number } {
  if (allDay) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return {
      start,
      end,
      durationMinutes: 24 * 60 - 1,
    };
  }

  const start = combineDateAndTime(date, startTime);
  const end = combineDateAndTime(date, endTime);
  return {
    start,
    end,
    durationMinutes: getDurationMinutes(start ?? date, end ?? date),
  };
}

function useGoogleSync(
  googleConnection?: { is_connected?: boolean; sync_to_google?: boolean } | null,
) {
  const shouldSync = googleConnection?.is_connected && googleConnection?.sync_to_google;

  const syncInBackground = useCallback(() => {
    if (!shouldSync) {
      return;
    }

    syncGoogleCalendar().catch(() => null);
  }, [shouldSync]);

  const syncWithFeedback = useCallback(
    async (successMessage: string) => {
      if (!shouldSync) {
        return;
      }

      try {
        const result = await syncGoogleCalendar({ parseJson: true });
        if (result?.error) {
          if (result.needsReconnection) {
            toast.warning(
              `${successMessage}. A sincronização está pendente: reconecte sua conta Google Calendar nas configurações.`,
              { duration: 6000 },
            );
            return;
          }
          return;
        }
      } catch {
        // Failed to trigger sync. Retry will continue in queue.
      }
    },
    [shouldSync],
  );

  return {
    syncInBackground,
    syncWithFeedback,
  };
}

export function useCalendarPageController() {
  useGoogleCalendarConnectionFeedback();

  const { data: googleConnection } = useGoogleCalendarConnection();
  const { userTimezone, handleEventCreate, eventCreationOptions } = useSpaceEventCreation();

  const { data: dbEvents = [], isPending } = useCalendarEvents();
  const { data: dbHolidays = [] } = useCalendarHolidays({
    year: nowInTimezone(userTimezone).getFullYear(),
  });
  const { data: birthdayEvents = [] } = useCalendarBirthdays();
  const { data: locations = [] } = usePsychologistLocations();
  const { data: sessions = [], isPending: isPendingSessions } = usePsychologistClinicalSessions();

  const { syncInBackground, syncWithFeedback } = useGoogleSync(googleConnection);

  const getMeetLink = useCallback(async (eventId: string): Promise<string | null> => {
    const result = await getEventMeetLinkAction({ eventId });
    if (!result.success) {
      return null;
    }
    return result.data.meetLink;
  }, []);

  const uiEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarUiEvent[] = mapDbEventsToUiEvents(
      dbEvents as DbCalendarEvent[],
      userTimezone,
    );
    const holidays = mapDbHolidaysToUiEvents(dbHolidays, userTimezone);
    const birthdays: CalendarEvent[] = birthdayEvents;
    return [...events, ...holidays, ...birthdays];
  }, [dbEvents, dbHolidays, birthdayEvents, userTimezone]);

  const sessionByEventId = useMemo(
    () =>
      new Map(
        sessions
          .filter((session) => typeof session.calendar_event_id === "string")
          .map((session) => [session.calendar_event_id!, session]),
      ),
    [sessions],
  );

  const getEditInitialValues = useCallback(
    (event: CalendarEventFull): Partial<EventCreationFormValues> => {
      return buildSessionEditOverrides(event, sessionByEventId.get(event.id));
    },
    [sessionByEventId],
  );

  const handleEventAdd = useCallback(
    async (event: CalendarEvent) => {
      const calendarId = typeof event.calendarId === "string" ? event.calendarId : undefined;
      const sourceId: CalendarSourceId =
        calendarId && isCalendarSourceId(calendarId) ? calendarId : "other";
      const eventType = mapCalendarSourceToEventType(sourceId);

      const durationMinutes = getDurationMinutes(event.start, event.end);
      const startBase = new Date(event.start);
      const endBase = new Date(event.end);
      const normalizedStart = event.allDay
        ? new Date(startBase.getFullYear(), startBase.getMonth(), startBase.getDate(), 0, 0, 0, 0)
        : startBase;
      const normalizedEnd = event.allDay
        ? new Date(
            startBase.getFullYear(),
            startBase.getMonth(),
            startBase.getDate(),
            23,
            59,
            59,
            999,
          )
        : endBase;
      const startDatetimeUtc = wallClockDateToUtcIso(normalizedStart, userTimezone);
      const endDatetimeUtc = wallClockDateToUtcIso(normalizedEnd, userTimezone);

      try {
        if (eventType === "session") {
          throw new Error("Sessões devem ser criadas pelo fluxo de criação de sessão.");
        }

        const createdEvent = unwrapActionResult(
          await createCalendarEventAction({
          eventType,
          title: event.title || "(sem título)",
          ...(event.description ? { description: event.description } : {}),
          ...(event.location ? { location: event.location } : {}),
          startDatetime: startDatetimeUtc,
          endDatetime: endDatetimeUtc,
          durationMinutes,
          allDay: event.allDay ?? false,
          color: event.color ?? "sky",
          timezone: userTimezone,
          }),
        );

        toast.success("Evento criado com sucesso!");

        if (createdEvent) {
          syncInBackground();
        }
      } catch (error) {
        toast.error(getCreateEventErrorMessage(error));
      }
    },
    [syncInBackground, userTimezone],
  );

  const handleEventUpdate = useCallback(
    async (event: CalendarEvent) => {
      if (event.calendarId === "holidays" || event.calendarId === "birthdays") {
        return;
      }

      if (!event.id) {
        await handleEventAdd(event);
        return;
      }

      const durationMinutes = getDurationMinutes(event.start, event.end);
      const startBase = new Date(event.start);
      const endBase = new Date(event.end);
      const normalizedStart = event.allDay
        ? new Date(startBase.getFullYear(), startBase.getMonth(), startBase.getDate(), 0, 0, 0, 0)
        : startBase;
      const normalizedEnd = event.allDay
        ? new Date(
            startBase.getFullYear(),
            startBase.getMonth(),
            startBase.getDate(),
            23,
            59,
            59,
            999,
          )
        : endBase;
      const startDatetimeUtc = wallClockDateToUtcIso(normalizedStart, userTimezone);
      const endDatetimeUtc = wallClockDateToUtcIso(normalizedEnd, userTimezone);

      try {
        unwrapActionResult(
          await updateEventAction({
          eventId: event.id,
          title: event.title || "(sem título)",
          ...(event.description !== undefined && { description: event.description }),
          ...(event.location !== undefined && { location: event.location }),
          startDatetime: startDatetimeUtc,
          endDatetime: endDatetimeUtc,
          durationMinutes,
          allDay: event.allDay ?? false,
          color: event.color ?? "sky",
          }),
        );

        toast.success("Evento atualizado com sucesso!");
        await syncWithFeedback("Evento atualizado");
      } catch {
        toast.error("Erro ao atualizar evento");
      }
    },
    [handleEventAdd, syncWithFeedback, userTimezone],
  );

  const handleEventConvertToSeries = useCallback(
    async (event: CalendarEventFull, data: EventCreationFormValues) => {
      if (!event.id || !data.recurrenceRule) {
        throw new Error("Conversão para recorrência requer evento e regra de repetição");
      }

      validateEventData(data);

      const range = resolveEventDateRange(data.date, data.startTime, data.endTime, data.allDay);
      if (!range.start || !range.end) {
        throw new Error("Horário inválido");
      }

      const startDatetimeUtc = wallClockDateToUtcIso(range.start, userTimezone);
      const endDatetimeUtc = wallClockDateToUtcIso(range.end, userTimezone);
      const effectiveStart = wallClockDateToYmd(data.date);
      const startTime = data.allDay ? "00:00:00" : `${data.startTime}:00`;
      const endTime = data.allDay ? "23:59:00" : `${data.endTime}:00`;
      const eventMetadata = event.metadata ?? {};
      const session = sessionByEventId.get(event.id);
      const existingLocationId =
        session?.location_id ?? getNonEmptyStringValue(eventMetadata.location_id);
      const nextLocationId = data.locationId ?? existingLocationId;
      const locationName = nextLocationId
        ? (locations.find((loc) => loc.id === nextLocationId)?.name ?? session?.locationName)
        : event.location;
      const existingPrice =
        session?.snapshot_price_cents ??
        (typeof eventMetadata.price === "number" ? eventMetadata.price : undefined);
      const nextPrice = data.price !== undefined ? Math.round(data.price * 100) : existingPrice;
      const existingSessionNumber =
        session?.session_number ??
        (typeof eventMetadata.session_number === "number"
          ? eventMetadata.session_number
          : undefined);

      const baseSeriesPayload = {
        eventId: event.id,
        title: data.title,
        ...(data.notes
          ? { description: data.notes }
          : session?.notes
            ? { description: session.notes }
            : {}),
        ...(locationName ? { location: locationName } : {}),
        startTime,
        endTime,
        startDatetime: startDatetimeUtc,
        endDatetime: endDatetimeUtc,
        durationMinutes: data.allDay ? 24 * 60 - 1 : data.durationMinutes,
        timezone: userTimezone,
        rrule: data.recurrenceRule,
        effectiveStart,
      };

      try {
        if (data.eventType === "session") {
          const patientId =
            data.patientId ??
            session?.psychologist_patient_id ??
            getNonEmptyStringValue(eventMetadata.patient_id);
          if (!patientId) throw new Error("Paciente é obrigatório");

          const sessionTypeId = getNonEmptyStringValue(eventMetadata.session_type_id);
          const serviceId =
            data.serviceId ??
            session?.psychologist_service_id ??
            getNonEmptyStringValue(eventMetadata.service_id);

          unwrapActionResult(
            await convertEventToSeriesAction({
            ...baseSeriesPayload,
            eventType: "session",
            patientId,
            ...(serviceId ? { serviceId } : {}),
            ...(nextLocationId ? { locationId: nextLocationId } : {}),
            ...(nextPrice !== undefined ? { price: nextPrice } : {}),
            ...(existingSessionNumber !== undefined
              ? { sessionNumber: existingSessionNumber }
              : {}),
            ...(sessionTypeId ? { sessionTypeId } : {}),
            metadata: {
              ...eventMetadata,
              patient_id: patientId,
              ...(serviceId ? { service_id: serviceId } : {}),
              ...(nextLocationId ? { location_id: nextLocationId } : {}),
              ...(nextPrice !== undefined ? { price: nextPrice } : {}),
              ...(existingSessionNumber !== undefined
                ? { session_number: existingSessionNumber }
                : {}),
              ...(sessionTypeId ? { session_type_id: sessionTypeId } : {}),
            },
            }),
          );
        } else {
          const metadata =
            data.eventType === "supervision"
              ? {
                  ...eventMetadata,
                  ...(data.supervisionType ? { supervision_type: data.supervisionType } : {}),
                  ...(data.supervisorName ? { supervisor_name: data.supervisorName } : {}),
                  ...(data.superviseeName ? { supervisee_name: data.superviseeName } : {}),
                  ...(data.topic ? { topic: data.topic } : {}),
                  ...(data.createGoogleMeet ? { google_meet_link: null } : {}),
                }
              : {
                  ...eventMetadata,
                  ...(data.createGoogleMeet ? { google_meet_link: null } : {}),
                };

          unwrapActionResult(
            await convertEventToSeriesAction({
            ...baseSeriesPayload,
            eventType: data.eventType ?? "other",
            allDay: data.allDay ?? false,
            metadata,
            }),
          );
        }

        toast.success("Evento convertido em recorrente com sucesso!");
        await syncWithFeedback("Evento recorrente criado");
      } catch (error) {
        toast.error(getCreateEventErrorMessage(error));
        throw error;
      }
    },
    [locations, sessionByEventId, syncWithFeedback, userTimezone],
  );

  const handleEventDelete = useCallback(
    async (eventId: string) => {
      if (eventId.startsWith("holiday-") || eventId.startsWith("birthday-")) {
        return;
      }

      try {
        unwrapActionResult(await deleteEventAction({ eventId }));
        toast.success("Evento deletado com sucesso!");
      } catch {
        toast.error("Erro ao deletar evento");
      }
    },
    [],
  );

  const handleSeriesUpdate = useCallback(
    async (
      eventId: string,
      _seriesId: string,
      updates: Record<string, unknown>,
      scope: SeriesEditScope,
    ) => {
      try {
        const seriesUpdates: UpdateCalendarEventSeriesInput & {
          timezone?: string;
          allDay?: boolean;
        } = {};

        if (typeof updates.title === "string") seriesUpdates.title = updates.title;
        if (typeof updates.description === "string")
          seriesUpdates.description = updates.description;
        if (typeof updates.location === "string") seriesUpdates.location = updates.location;
        if (typeof updates.color === "string") seriesUpdates.color = updates.color;
        if (typeof updates.startTime === "string") seriesUpdates.startTime = updates.startTime;
        if (typeof updates.endTime === "string") seriesUpdates.endTime = updates.endTime;
        if (typeof updates.durationMinutes === "number") {
          seriesUpdates.durationMinutes = updates.durationMinutes;
        }
        if (typeof updates.allDay === "boolean") {
          seriesUpdates.allDay = updates.allDay;
        }
        if (typeof updates.timezone === "string") {
          seriesUpdates.timezone = updates.timezone;
        }
        if (typeof updates.rrule === "string") seriesUpdates.rrule = updates.rrule;
        if (updates.metadata && typeof updates.metadata === "object") {
          seriesUpdates.metadata = updates.metadata as Record<string, unknown>;
        }

        unwrapActionResult(
          await updateSeriesInstanceAction({
          eventId,
          updates: seriesUpdates,
          scope,
          }),
        );

        toast.success("Evento recorrente atualizado com sucesso!");
      } catch {
        toast.error("Erro ao atualizar evento recorrente");
      }
    },
    [],
  );

  const handleSeriesDelete = useCallback(
    async (eventId: string, seriesId: string, scope: SeriesEditScope) => {
      try {
        unwrapActionResult(await deleteSeriesAction({ seriesId, scope, eventId }));
        toast.success("Evento recorrente removido com sucesso!");
      } catch {
        toast.error("Erro ao remover evento recorrente");
      }
    },
    [],
  );

  const handleEventsChange = useCallback(
    (_events: CalendarEvent[]) => {
      syncInBackground();
    },
    [syncInBackground],
  );

  const onEventAdd = useCallback(
    (event: CalendarEvent) => {
      handleEventAdd(event).catch(() => null);
    },
    [handleEventAdd],
  );

  const onEventUpdate = useCallback(
    (event: CalendarEvent) => {
      handleEventUpdate(event).catch(() => null);
    },
    [handleEventUpdate],
  );

  const onEventDelete = useCallback(
    (eventId: string) => {
      handleEventDelete(eventId).catch(() => null);
    },
    [handleEventDelete],
  );

  return {
    isPending: isPending || isPendingSessions,
    timezone: userTimezone,
    calendars: [...CALENDAR_SOURCES],
    initialEvents: uiEvents,
    getMeetLink,
    onEventAdd,
    onEventUpdate,
    onEventConvertToSeries: handleEventConvertToSeries,
    getEditInitialValues,
    onEventDelete,
    onSeriesUpdate: handleSeriesUpdate,
    onSeriesDelete: handleSeriesDelete,
    onEventsChange: handleEventsChange,
    onEventCreate: handleEventCreate,
    eventCreationOptions,
  };
}
