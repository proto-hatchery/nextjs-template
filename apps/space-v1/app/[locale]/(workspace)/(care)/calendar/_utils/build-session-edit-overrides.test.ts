import type { CalendarEventFull } from "@/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/event-quick-view-popover";
import { describe, expect, it } from "vitest";

import { buildSessionEditOverrides } from "./build-session-edit-overrides";

describe("buildSessionEditOverrides", () => {
  it("prefills notes, location, patient, service, and price from session details", () => {
    const event: CalendarEventFull = {
      id: "event-1",
      title: "Sessão - Paciente",
      start: new Date("2026-03-12T10:00:00.000Z"),
      end: new Date("2026-03-12T10:50:00.000Z"),
      metadata: {
        patient_id: "patient-from-event",
        service_id: "service-from-event",
        price: 9000,
      },
    };

    const overrides = buildSessionEditOverrides(event, {
      location_id: "location-1",
      notes: "Clinical note from session row",
      psychologist_patient_id: "patient-1",
      psychologist_service_id: "service-1",
      snapshot_price_cents: 15000,
    });

    expect(overrides).toEqual({
      locationId: "location-1",
      notes: "Clinical note from session row",
      patientId: "patient-1",
      serviceId: "service-1",
      price: 150,
    });
  });

  it("falls back to calendar event metadata when session details are missing", () => {
    const event: CalendarEventFull = {
      id: "event-2",
      title: "Sessão - Paciente",
      start: new Date("2026-03-12T10:00:00.000Z"),
      end: new Date("2026-03-12T10:50:00.000Z"),
      metadata: {
        location_id: "location-2",
        notes: "Metadata note",
        patient_id: "patient-2",
        service_id: "service-2",
        price: 12000,
      },
    };

    expect(buildSessionEditOverrides(event)).toEqual({
      locationId: "location-2",
      notes: "Metadata note",
      patientId: "patient-2",
      serviceId: "service-2",
      price: 120,
    });
  });
});
