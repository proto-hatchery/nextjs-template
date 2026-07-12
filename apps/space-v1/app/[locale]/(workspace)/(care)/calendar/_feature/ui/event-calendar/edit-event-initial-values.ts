import { format } from "date-fns";

import type { CalendarEventFull } from "./event-quick-view-popover";
import type { EventCreationFormValues, LocationOption } from "./event-creation-modal";

type EventMetadata = CalendarEventFull["metadata"];

function getStringMetadataValue(metadata: EventMetadata, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" ? value : undefined;
}

export function getEditEventInitialValues(
  editingEvent: CalendarEventFull,
  locations?: LocationOption[],
): Partial<EventCreationFormValues> {
  const metadata = editingEvent.metadata;
  const matchedLocationId =
    locations?.find((location) => location.name === editingEvent.location)?.id ??
    getStringMetadataValue(metadata, "location_id") ??
    "";

  const notes =
    editingEvent.description ??
    getStringMetadataValue(metadata, "notes") ??
    getStringMetadataValue(metadata, "description");

  return {
    title: editingEvent.title,
    date: new Date(editingEvent.start),
    startTime: format(new Date(editingEvent.start), "HH:mm"),
    endTime: format(new Date(editingEvent.end), "HH:mm"),
    allDay: editingEvent.allDay ?? false,
    durationMinutes: Math.round(
      (new Date(editingEvent.end).getTime() - new Date(editingEvent.start).getTime()) / (1000 * 60),
    ),
    ...(notes !== undefined ? { notes } : {}),
    eventType: editingEvent.event_type ?? "other",
    recurrenceRule: editingEvent.recurrence_rule ?? "",
    patientId: getStringMetadataValue(metadata, "patient_id") ?? "",
    serviceId: getStringMetadataValue(metadata, "service_id") ?? "",
    locationId: matchedLocationId,
    ...(typeof metadata?.price === "number" ? { price: metadata.price / 100 } : {}),
  };
}
