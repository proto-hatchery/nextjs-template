/**
 * Unit tests for useCalendarEventsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useCalendarEventsMutation } from "@workspace/supabase-data/hooks/calendar/use-calendar-events-mutation.hook.codegen"
import { calendarQueryKeys } from "@workspace/supabase-data/hooks/calendar/query-keys.codegen"

describe("useCalendarEventsMutation", () => {
  it("should export the generated hook", () => {
    expect(useCalendarEventsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(calendarQueryKeys.calendarEvents()).toBeDefined()
  })
})
