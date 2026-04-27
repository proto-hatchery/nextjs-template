// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { CalendarEventSeriesExceptionsSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-event-series-exceptions-supabase.repository.codegen"

describe.skip("calendar-event-series-exceptions repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void CalendarEventSeriesExceptionsSupabaseRepository
  })
})
