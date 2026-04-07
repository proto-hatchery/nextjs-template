/**
 * Unit tests for useCalendarEventSeriesQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useCalendarEventSeriesQuery } from "@workspace/supabase-data/hooks/calendar/use-calendar-event-series-query.hook.codegen"
import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

describe("useCalendarEventSeriesQuery", () => {
  it("should export the generated hook", () => {
    expect(useCalendarEventSeriesQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(calendarQueryKeys.calendarEventSeriesList({})).toBeDefined()
  })
})
