/**
 * Unit tests for useCalendarEventsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useCalendarEventsQuery } from "@workspace/supabase-data/hooks/calendar/use-calendar-events-query.hook.codegen"
import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

describe("useCalendarEventsQuery", () => {
  it("should export the generated hook", () => {
    expect(useCalendarEventsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(calendarQueryKeys.calendarEventsList({})).toBeDefined()
  })
})
