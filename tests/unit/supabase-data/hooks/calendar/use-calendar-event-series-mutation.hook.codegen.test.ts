/**
 * Unit tests for useCalendarEventSeriesMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useCalendarEventSeriesMutation } from "@workspace/supabase-data/hooks/calendar/use-calendar-event-series-mutation.hook.codegen"
import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

describe("useCalendarEventSeriesMutation", () => {
  it("should export the generated hook", () => {
    expect(useCalendarEventSeriesMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(calendarQueryKeys.calendarEventSeries()).toBeDefined()
  })
})
