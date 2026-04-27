// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { CalendarHolidaysSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-holidays-supabase.repository.codegen"

describe.skip("calendar-holidays repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void CalendarHolidaysSupabaseRepository
  })
})
