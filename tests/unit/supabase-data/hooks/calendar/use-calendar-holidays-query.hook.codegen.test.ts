/**
 * Unit tests for useCalendarHolidaysQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useCalendarHolidaysQuery } from "@workspace/supabase-data/hooks/calendar/use-calendar-holidays-query.hook.codegen"
import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

describe("useCalendarHolidaysQuery", () => {
  it("should export the generated hook", () => {
    expect(useCalendarHolidaysQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(calendarQueryKeys.calendarHolidaysList({})).toBeDefined()
  })
})
