"use client";

import { useCallback, useMemo } from "react";
import {
  type EventCreationFormValues,
  EventCreationModal,
} from "../../(care)/calendar/_feature/ui/event-calendar/event-creation-modal";
import { useSpaceEventCreation } from "../../(care)/calendar/_hooks/use-space-event-creation";

const SESSION_DURATION_MINUTES = 50;

function calculateEndTimeFromStart(startTime: string, durationMinutes: number): string {
  const [hours = 0, minutes = 0] = startTime.split(":").map(Number);
  const totalStartMinutes = hours * 60 + minutes;
  const totalEndMinutes = totalStartMinutes + durationMinutes;
  const normalizedMinutes = ((totalEndMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const endHours = Math.floor(normalizedMinutes / 60);
  const endMinutes = normalizedMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}

export interface SpaceEventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultPatientId?: string;
  prefilledDate?: Date;
  prefilledTime?: string;
}

export function SpaceEventCreationModal({
  isOpen,
  onClose,
  onSuccess,
  defaultPatientId,
  prefilledDate,
  prefilledTime,
}: SpaceEventCreationModalProps) {
  const { handleEventCreate, eventCreationOptions, userTimezone } = useSpaceEventCreation();

  const initialValues = useMemo(() => {
    const patientId = defaultPatientId ?? "";
    return {
      patientId,
      serviceId: "",
      locationId: "",
      ...(defaultPatientId ? { eventType: "session" as const } : {}),
      ...(prefilledDate ? { date: prefilledDate } : {}),
      ...(prefilledTime
        ? {
            startTime: prefilledTime,
            endTime: calculateEndTimeFromStart(prefilledTime, SESSION_DURATION_MINUTES),
            durationMinutes: SESSION_DURATION_MINUTES,
          }
        : {}),
    };
  }, [defaultPatientId, prefilledDate, prefilledTime]);

  const onSubmit = useCallback(
    async (data: EventCreationFormValues) => {
      await handleEventCreate(data);
      onSuccess?.();
    },
    [handleEventCreate, onSuccess],
  );

  return (
    <EventCreationModal
      header={{
        title: defaultPatientId ? "Nova sessão" : "Novo evento",
        show: true,
        showClose: true,
      }}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      timezone={userTimezone}
      patients={eventCreationOptions.patients}
      locations={eventCreationOptions.locations}
      services={eventCreationOptions.services}
      isLoadingPatients={eventCreationOptions.isLoadingPatients}
      isLoadingLocations={eventCreationOptions.isLoadingLocations}
      isLoadingServices={eventCreationOptions.isLoadingServices}
      hasGoogleMeetAccess={eventCreationOptions.hasGoogleMeetAccess}
      initialValues={initialValues}
      lockEventType={Boolean(defaultPatientId)}
    />
  );
}
