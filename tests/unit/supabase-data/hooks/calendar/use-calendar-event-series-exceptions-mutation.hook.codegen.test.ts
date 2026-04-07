/**
 * Unit tests for useCalendarEventSeriesExceptionsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useCalendarEventSeriesExceptionsMutation } from "@workspace/supabase-data/hooks/calendar/use-calendar-event-series-exceptions-mutation.hook.codegen"
import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

describe("useCalendarEventSeriesExceptionsMutation", () => {
  it("should export the generated hook", () => {
    expect(useCalendarEventSeriesExceptionsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(calendarQueryKeys.calendarEventSeriesExceptions()).toBeDefined()
  })
})
