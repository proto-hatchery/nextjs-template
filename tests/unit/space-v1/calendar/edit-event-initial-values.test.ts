import { describe, expect, it } from "vitest";

import { getEditEventInitialValues } from "../../../../apps/space-v1/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/edit-event-initial-values";
import type { CalendarEventFull } from "../../../../apps/space-v1/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/event-quick-view-popover";

describe("getEditEventInitialValues", () => {
  it("prefills notes and locationId from the existing event", () => {
    const editingEvent: CalendarEventFull = {
      id: "event-1",
      title: "Sessao Inicial",
      start: new Date("2025-07-31T13:00:00.000Z"),
      end: new Date("2025-07-31T13:50:00.000Z"),
      allDay: false,
      description: "Paciente relatou melhora",
      location: "Sala 2",
      event_type: "session",
      recurrence_rule: null,
      metadata: {
        patient_id: "patient-1",
        service_id: "service-1",
        price: 15000,
      },
    };

    const initialValues = getEditEventInitialValues(editingEvent, [
      { id: "loc-1", name: "Online" },
      { id: "loc-2", name: "Sala 2" },
    ]);

    expect(initialValues.notes).toBe("Paciente relatou melhora");
    expect(initialValues.locationId).toBe("loc-2");
    expect(initialValues.serviceId).toBe("service-1");
    expect(initialValues.patientId).toBe("patient-1");
    expect(initialValues.price).toBe(150);
  });

  it("falls back to metadata notes and location_id when top-level fields are absent", () => {
    const editingEvent: CalendarEventFull = {
      id: "event-2",
      title: "Sessao de retorno",
      start: new Date("2025-08-01T14:00:00.000Z"),
      end: new Date("2025-08-01T14:50:00.000Z"),
      allDay: false,
      event_type: "session",
      metadata: {
        notes: "Observacao salva em metadata",
        location_id: "loc-3",
      },
    };

    const initialValues = getEditEventInitialValues(editingEvent, [
      { id: "loc-3", name: "Consultorio" },
    ]);

    expect(initialValues.notes).toBe("Observacao salva em metadata");
    expect(initialValues.locationId).toBe("loc-3");
  });
});
