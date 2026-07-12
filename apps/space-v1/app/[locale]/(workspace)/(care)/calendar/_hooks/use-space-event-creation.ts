"use client";

import type {
  EventCreationFormValues,
  LocationOption,
  PatientOption,
  ServiceOption,
} from "@/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/event-creation-modal";
import { createBlockAction } from "@workspace/supabase-data/actions/calendar/create-block-event";
import { createCalendarEventAction } from "@workspace/supabase-data/actions/calendar/create-calendar-event";
import { createRecurringSessionAction } from "@workspace/supabase-data/actions/calendar/create-recurring-session";
import { createSeriesAction } from "@workspace/supabase-data/actions/calendar/create-series";
import { createSessionAction as createSessionEventAction } from "@workspace/supabase-data/actions/calendar/create-session-event";
import { createSupervisionAction } from "@workspace/supabase-data/actions/calendar/create-supervision-event";
import { usePsychologistPatients } from "@workspace/supabase-data/hooks/patients";
import {
  usePsychologist,
  usePsychologistLocations,
  usePsychologistServices,
} from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { useGoogleCalendarConnection } from "@workspace/supabase-data/hooks/queries";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import {
  combineDateAndTime,
  getCreateEventErrorMessage,
  validateEventData,
} from "../_utils/event-creation-utils";
import { getDurationMinutes } from "../_utils/event-mappers";
import { syncGoogleCalendar } from "../_utils/google-calendar-sync";
import {
  normalizeTimezone,
  wallClockDateToUtcIso,
  wallClockDateToYmd,
} from "../_utils/timezone-datetime";

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
          }
        }
      } catch {
        // Failed to trigger sync. Retry will continue in queue.
      }
    },
    [shouldSync],
  );

  return { syncInBackground, syncWithFeedback };
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

export interface SpaceEventCreationOptions {
  patients: PatientOption[];
  locations: LocationOption[];
  services: ServiceOption[];
  isLoadingPatients: boolean;
  isLoadingLocations: boolean;
  isLoadingServices: boolean;
  hasGoogleMeetAccess: boolean;
}

/**
 * Shared calendar event creation (same mutations and option lists as the calendar page).
 * Use with {@link EventCreationModal} from `@/compat/features/calendar` outside CalendarPageLayout.
 */
export function useSpaceEventCreation(): {
  userTimezone: string;
  handleEventCreate: (data: EventCreationFormValues) => Promise<void>;
  eventCreationOptions: SpaceEventCreationOptions;
} {
  const { data: googleConnection } = useGoogleCalendarConnection();
  const { data: psychologist } = usePsychologist();

  const userTimezone = useMemo(
    () => normalizeTimezone(psychologist?.timezone),
    [psychologist?.timezone],
  );

  const { data: patients = [], isPending: isPendingPatients } = usePsychologistPatients({
    status: ["active", "inactive"],
  });
  const { data: locations = [], isPending: isPendingLocations } = usePsychologistLocations();
  const { data: services = [], isPending: isPendingServices } = usePsychologistServices();

  const { syncInBackground, syncWithFeedback } = useGoogleSync(googleConnection);

  const patientOptions = useMemo<PatientOption[]>(
    () =>
      patients.map((patient) => ({
        id: patient.id,
        name: patient.displayName,
      })),
    [patients],
  );

  const locationOptions = useMemo<LocationOption[]>(
    () =>
      locations
        .filter((location) => location.name !== null)
        .map((location) => ({
          id: location.id,
          name: location.name!,
        })),
    [locations],
  );

  const serviceOptions = useMemo<ServiceOption[]>(
    () =>
      services.map((service) => ({
        id: service.id,
        name: service.reference?.name ?? service.name ?? "Serviço",
        price:
          service.price === null || service.price === undefined
            ? null
            : Number((service.price / 100).toFixed(2)),
        durationMinutes: service.duration_minutes,
      })),
    [services],
  );

  const handleEventCreate = useCallback(
    async (data: EventCreationFormValues) => {
      validateEventData(data);

      const range = resolveEventDateRange(data.date, data.startTime, data.endTime, data.allDay);
      const startDatetime = range.start;
      const endDatetime = range.end;

      if (!startDatetime || !endDatetime) {
        throw new Error("Horário inválido");
      }
      const startDatetimeUtc = wallClockDateToUtcIso(startDatetime, userTimezone);
      const endDatetimeUtc = wallClockDateToUtcIso(endDatetime, userTimezone);

      const locationName: string | undefined = data.locationId
        ? (locations.find((loc) => loc.id === data.locationId)?.name ?? undefined)
        : undefined;

      try {
        if (data.recurrenceRule) {
          const startTime = `${data.startTime}:00`;
          const endTime = `${data.endTime}:00`;
          const effectiveStart = wallClockDateToYmd(data.date);

          if (data.eventType === "session") {
            if (!data.patientId) throw new Error("Paciente é obrigatório");
            unwrapActionResult(
              await createRecurringSessionAction({
              title: data.title,
              ...(data.notes ? { description: data.notes } : {}),
              ...(locationName ? { location: locationName } : {}),
              startTime,
              endTime,
              durationMinutes: data.durationMinutes,
              timezone: userTimezone,
              rrule: data.recurrenceRule,
              effectiveStart,
              patientId: data.patientId,
              ...(data.serviceId ? { serviceId: data.serviceId } : {}),
              ...(data.locationId ? { locationId: data.locationId } : {}),
              ...(data.price !== undefined ? { price: Math.round(data.price * 100) } : {}),
              }),
            );
          } else if (data.eventType === "supervision") {
            if (!data.supervisionType) throw new Error("Tipo de supervisão é obrigatório");
            unwrapActionResult(
              await createSeriesAction({
              eventType: data.eventType,
              title: data.title,
              ...(data.notes ? { description: data.notes } : {}),
              ...(locationName ? { location: locationName } : {}),
              startTime,
              endTime,
              durationMinutes: data.durationMinutes,
              timezone: userTimezone,
              rrule: data.recurrenceRule,
              effectiveStart,
              metadata: {
                supervision_type: data.supervisionType,
                ...(data.supervisorName ? { supervisor_name: data.supervisorName } : {}),
                ...(data.superviseeName ? { supervisee_name: data.superviseeName } : {}),
                ...(data.topic ? { topic: data.topic } : {}),
                ...(data.createGoogleMeet ? { google_meet_link: null } : {}),
              },
              }),
            );
          } else {
            unwrapActionResult(
              await createSeriesAction({
              eventType: data.eventType ?? "other",
              title: data.title,
              ...(data.notes ? { description: data.notes } : {}),
              ...(locationName ? { location: locationName } : {}),
              startTime: data.allDay ? "00:00:00" : startTime,
              endTime: data.allDay ? "23:59:00" : endTime,
              durationMinutes: data.allDay ? 24 * 60 - 1 : data.durationMinutes,
              allDay: data.allDay ?? false,
              timezone: userTimezone,
              rrule: data.recurrenceRule,
              effectiveStart,
              metadata: {
                ...(data.category ? { category: data.category } : {}),
                ...(data.createGoogleMeet ? { google_meet_link: null } : {}),
              },
              }),
            );
          }

          toast.success("Evento recorrente criado com sucesso!");
          syncInBackground();
          return;
        }

        if (data.eventType === "session") {
          if (!data.patientId) throw new Error("Paciente é obrigatório");
          unwrapActionResult(
            await createSessionEventAction({
            title: data.title,
            ...(data.notes ? { description: data.notes } : {}),
            startDatetime: startDatetimeUtc,
            endDatetime: endDatetimeUtc,
            durationMinutes: data.durationMinutes,
            patientId: data.patientId,
            ...(data.serviceId ? { serviceId: data.serviceId } : {}),
            ...(data.locationId ? { locationId: data.locationId } : {}),
            ...(locationName ? { location: locationName } : {}),
            ...(data.price !== undefined ? { price: Math.round(data.price * 100) } : {}),
            ...(data.createGoogleMeet ? { createGoogleMeet: data.createGoogleMeet } : {}),
            status: "scheduled",
            timezone: userTimezone,
            }),
          );
        } else if (data.eventType === "supervision") {
          if (!data.supervisionType) throw new Error("Tipo de supervisão é obrigatório");
          unwrapActionResult(
            await createSupervisionAction({
            title: data.title,
            ...(data.notes ? { description: data.notes } : {}),
            startDatetime: startDatetimeUtc,
            endDatetime: endDatetimeUtc,
            durationMinutes: data.durationMinutes,
            supervisionType: data.supervisionType,
            ...(data.supervisorName ? { supervisorName: data.supervisorName } : {}),
            ...(data.superviseeName ? { superviseeName: data.superviseeName } : {}),
            ...(data.topic ? { topic: data.topic } : {}),
            ...(data.createGoogleMeet ? { createGoogleMeet: data.createGoogleMeet } : {}),
            status: "scheduled",
            timezone: userTimezone,
            ...(locationName ? { location: locationName } : {}),
            }),
          );
        } else if (data.eventType === "block") {
          unwrapActionResult(
            await createBlockAction({
            title: data.title,
            ...(data.notes ? { description: data.notes } : {}),
            startDatetime: startDatetimeUtc,
            endDatetime: endDatetimeUtc,
            durationMinutes: data.durationMinutes,
            allDay: data.allDay ?? false,
            ...(locationName ? { location: locationName } : {}),
            timezone: userTimezone,
            }),
          );
        } else {
          unwrapActionResult(
            await createCalendarEventAction({
            eventType: data.eventType ?? "other",
            title: data.title,
            ...(data.notes ? { description: data.notes } : {}),
            startDatetime: startDatetimeUtc,
            endDatetime: endDatetimeUtc,
            durationMinutes: range.durationMinutes,
            allDay: data.allDay ?? false,
            ...(locationName ? { location: locationName } : {}),
            metadata: {
              ...(data.category ? { category: data.category } : {}),
              ...(data.createGoogleMeet ? { google_meet_link: null } : {}),
            },
            status: "scheduled",
            timezone: userTimezone,
            }),
          );
        }

        toast.success("Evento criado com sucesso!");
        await syncWithFeedback("Evento criado");
      } catch (error) {
        toast.error(getCreateEventErrorMessage(error));
        throw error;
      }
    },
    [
      locations,
      syncInBackground,
      syncWithFeedback,
      userTimezone,
    ],
  );

  return {
    userTimezone,
    handleEventCreate,
    eventCreationOptions: {
      patients: patientOptions,
      locations: locationOptions,
      services: serviceOptions,
      isLoadingPatients: isPendingPatients,
      isLoadingLocations: isPendingLocations,
      isLoadingServices: isPendingServices,
      hasGoogleMeetAccess: googleConnection?.is_connected ?? false,
    },
  };
}
