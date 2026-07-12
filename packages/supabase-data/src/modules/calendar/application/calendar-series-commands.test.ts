import { describe, expect, it, vi, beforeEach } from "vitest";

import { convertCalendarEventToSeries } from "./calendar-series-commands";

const { expandSeriesMock, resolvePsychologistTimezoneMock } = vi.hoisted(() => ({
  expandSeriesMock: vi.fn(),
  resolvePsychologistTimezoneMock: vi.fn(),
}));

vi.mock("../../../utils/expand-series", () => ({
  expandSeries: expandSeriesMock,
}));

vi.mock("../../../utils/timezone", () => ({
  getCurrentDateInTimezone: vi.fn(() => "2025-07-31"),
  resolvePsychologistTimezone: resolvePsychologistTimezoneMock,
}));

type ExistingEvent = {
  psychologist_id: string;
  color: string | null;
  duration_minutes: number | null;
  all_day: boolean | null;
  metadata: Record<string, unknown> | null;
  original_start_datetime: string | null;
  original_end_datetime: string | null;
  start_datetime: string;
  end_datetime: string;
};

function createSupabaseMock(
  existingEvent: ExistingEvent,
  createdSeries: { id: string; timezone: string },
) {
  const updateEq = vi.fn(async () => ({ error: null }));
  const update = vi.fn(() => ({ eq: updateEq }));
  const selectExistingSingle = vi.fn(async () => ({ data: existingEvent, error: null }));
  const selectExistingEq = vi.fn(() => ({ single: selectExistingSingle }));
  const selectExisting = vi.fn(() => ({ eq: selectExistingEq }));
  const insertSeriesSingle = vi.fn(async () => ({ data: createdSeries, error: null }));
  const insertSeriesSelect = vi.fn(() => ({ single: insertSeriesSingle }));
  const insertSeries = vi.fn(() => ({ select: insertSeriesSelect }));

  const from = vi.fn((table: string) => {
    if (table === "calendar_events") {
      return {
        select: selectExisting,
        update,
      };
    }

    if (table === "calendar_event_series") {
      return {
        insert: insertSeries,
      };
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    insertSeries,
    update,
    updateEq,
    from,
    supabase: {
      from,
    },
  };
}

describe("convertCalendarEventToSeries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolvePsychologistTimezoneMock.mockResolvedValue("America/Sao_Paulo");
  });

  it("creates a recurring session series and links the existing event", async () => {
    const existingEvent = {
      psychologist_id: "psy-1",
      color: "#4285F4",
      duration_minutes: 50,
      all_day: false,
      metadata: { session_type_id: "session-type-1" },
      original_start_datetime: null,
      original_end_datetime: null,
      start_datetime: "2025-07-31T13:00:00.000Z",
      end_datetime: "2025-07-31T13:50:00.000Z",
    };
    const createdSeries = { id: "series-1", timezone: "America/Sao_Paulo" };
    const { supabase, insertSeries, update } = createSupabaseMock(existingEvent, createdSeries);

    await convertCalendarEventToSeries(supabase as never, "psy-1", {
      eventId: "event-1",
      eventType: "session",
      title: "Sessão Inicial",
      startTime: "10:00:00",
      endTime: "10:50:00",
      startDatetime: "2025-07-31T13:00:00.000Z",
      endDatetime: "2025-07-31T13:50:00.000Z",
      durationMinutes: 50,
      timezone: "America/Sao_Paulo",
      rrule: "FREQ=WEEKLY;COUNT=3",
      effectiveStart: "2025-07-31",
      patientId: "patient-1",
      serviceId: "service-1",
      locationId: "location-1",
      price: 15000,
      sessionNumber: 4,
      sessionTypeId: "session-type-1",
      metadata: {
        patient_id: "patient-1",
        service_id: "service-1",
        session_type_id: "session-type-1",
        location_id: "location-1",
        price: 15000,
        session_number: 4,
      },
    });

    expect(insertSeries).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: {
          location_id: "location-1",
          patient_id: "patient-1",
          price: 15000,
          session_number: 4,
          service_id: "service-1",
          session_type_id: "session-type-1",
        },
        psychologist_id: "psy-1",
        rrule: "FREQ=WEEKLY;COUNT=3",
        title: "Sessão Inicial",
      }),
    );
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        original_end_datetime: "2025-07-31T13:50:00.000Z",
        original_start_datetime: "2025-07-31T13:00:00.000Z",
        series_id: "series-1",
        timezone: "America/Sao_Paulo",
      }),
    );
    expect(expandSeriesMock).toHaveBeenCalledWith(
      expect.anything(),
      "series-1",
      expect.objectContaining({
        fromDate: "2025-08-01",
        timezone: "America/Sao_Paulo",
      }),
    );
  });

  it("creates a non-session series and preserves explicit metadata updates", async () => {
    const existingEvent = {
      psychologist_id: "psy-1",
      color: "sky",
      duration_minutes: 60,
      all_day: false,
      metadata: { category: "meeting" },
      original_start_datetime: "2025-07-30T09:00:00.000Z",
      original_end_datetime: "2025-07-30T10:00:00.000Z",
      start_datetime: "2025-07-31T09:00:00.000Z",
      end_datetime: "2025-07-31T10:00:00.000Z",
    };
    const createdSeries = { id: "series-2", timezone: "America/Sao_Paulo" };
    const { supabase, insertSeries, update } = createSupabaseMock(existingEvent, createdSeries);

    await convertCalendarEventToSeries(supabase as never, "psy-1", {
      eventId: "event-2",
      eventType: "meeting",
      title: "Reunião de acompanhamento",
      startTime: "09:00:00",
      endTime: "10:00:00",
      startDatetime: "2025-07-31T12:00:00.000Z",
      endDatetime: "2025-07-31T13:00:00.000Z",
      durationMinutes: 60,
      timezone: "America/Sao_Paulo",
      rrule: "FREQ=WEEKLY;COUNT=5",
      effectiveStart: "2025-07-31",
      allDay: false,
      metadata: { category: "meeting", google_meet_link: null },
    });

    expect(insertSeries).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "meeting",
        metadata: { category: "meeting", google_meet_link: null },
      }),
    );
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { category: "meeting", google_meet_link: null },
        series_id: "series-2",
        title: "Reunião de acompanhamento",
      }),
    );
  });
});
