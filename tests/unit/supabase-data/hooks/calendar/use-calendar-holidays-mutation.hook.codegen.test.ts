/**
 * Unit tests for useCalendarHolidaysMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useCalendarHolidaysMutation } from "@workspace/supabase-data/hooks/calendar/use-calendar-holidays-mutation.hook.codegen"
import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

describe("useCalendarHolidaysMutation", () => {
  it("should export the generated hook", () => {
    expect(useCalendarHolidaysMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(calendarQueryKeys.calendarHolidays()).toBeDefined()
  })
})
