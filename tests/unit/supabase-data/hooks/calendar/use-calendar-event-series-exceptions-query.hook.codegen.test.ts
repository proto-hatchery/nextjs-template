/**
 * Unit tests for useCalendarEventSeriesExceptionsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useCalendarEventSeriesExceptionsQuery } from "@workspace/supabase-data/hooks/calendar/use-calendar-event-series-exceptions-query.hook.codegen"
import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

describe("useCalendarEventSeriesExceptionsQuery", () => {
  it("should export the generated hook", () => {
    expect(useCalendarEventSeriesExceptionsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(calendarQueryKeys.calendarEventSeriesExceptionsList({})).toBeDefined()
  })
})
