import type { EventCreationFormValues } from "@/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/event-creation-modal";
import type { CalendarEventFull } from "@/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/event-quick-view-popover";

interface SessionEditSource {
  location_id?: string | null;
  locationName?: string | null;
  notes?: string | null;
  psychologist_patient_id?: string | null;
  psychologist_service_id?: string | null;
  snapshot_price_cents?: number | null;
  price?: number | null;
}

function getNonEmptyStringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export function buildSessionEditOverrides(
  event: CalendarEventFull,
  session?: SessionEditSource,
): Partial<EventCreationFormValues> {
  const metadata = event.metadata ?? {};
  const locationId = session?.location_id ?? getNonEmptyStringValue(metadata.location_id) ?? "";
  const notes =
    session?.notes ??
    event.description ??
    getNonEmptyStringValue(metadata.notes) ??
    getNonEmptyStringValue(metadata.description);
  const patientId =
    session?.psychologist_patient_id ?? getNonEmptyStringValue(metadata.patient_id) ?? "";
  const serviceId =
    session?.psychologist_service_id ?? getNonEmptyStringValue(metadata.service_id) ?? "";
  const priceCents =
    session?.snapshot_price_cents ??
    (typeof metadata.price === "number" ? metadata.price : undefined);

  return {
    ...(locationId ? { locationId } : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(patientId ? { patientId } : {}),
    ...(serviceId ? { serviceId } : {}),
    ...(priceCents !== undefined ? { price: priceCents / 100 } : {}),
  };
}
