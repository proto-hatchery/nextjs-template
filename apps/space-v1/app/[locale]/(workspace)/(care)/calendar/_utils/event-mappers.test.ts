import { describe, expect, it } from "vitest";

import { type DbCalendarEvent, mapDbEventsToUiEvents } from "./event-mappers";

describe("mapDbEventsToUiEvents", () => {
  it("hydrates session metadata from session fields stored on calendar events", () => {
    const dbEvent: DbCalendarEvent = {
      id: "event-1",
      title: "Sessão - Paciente",
      description: null,
      location: null,
      start_datetime: "2026-03-12T10:00:00.000Z",
      end_datetime: "2026-03-12T10:50:00.000Z",
      all_day: false,
      color: "sky",
      event_type: "session",
      series_id: null,
      duration_minutes: 50,
      status: "scheduled",
      metadata: {
        patient_id: "patient-1",
      },
      notes: "Observação clínica",
      location_id: "location-1",
      psychologist_service_id: "service-1",
      session_number: 4,
      snapshot_price_cents: 15000,
    };

    const [uiEvent] = mapDbEventsToUiEvents([dbEvent], "America/Sao_Paulo");

    expect(uiEvent!.metadata).toMatchObject({
      notes: "Observação clínica",
      location_id: "location-1",
      service_id: "service-1",
      session_number: 4,
      price: 15000,
    });
  });
});
