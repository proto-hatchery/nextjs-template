/**
 * Unit tests for deleteCalendarHolidaysAction
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it, vi, beforeEach } from "vitest"

import { deleteCalendarHolidaysAction } from "@workspace/supabase-data/actions/calendar/calendar-holidays-delete.codegen"

vi.mock("@workspace/supabase-auth/session/get-claims", () => ({
  getClaims: vi.fn(),
}))

vi.mock("@workspace/supabase-auth/server/create-server-auth-client", () => ({
  createServerAuthClient: vi.fn(),
}))

vi.mock("@workspace/supabase-data/lib/auth/rate-limit", () => ({
  checkActionRateLimit: vi.fn(),
}))

vi.mock("@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-holidays-supabase.repository.codegen", () => ({
  CalendarHolidaysSupabaseRepository: vi.fn(),
}))

vi.mock("@workspace/logging/server", () => ({
  logServerEvent: vi.fn(),
}))

const swallowExpectedError = (): undefined => undefined

describe("deleteCalendarHolidaysAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Authentication", () => {
    it("should throw Unauthorized when not authenticated", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      vi.mocked(getClaims).mockResolvedValue({ claims: null } as any)

      await expect(deleteCalendarHolidaysAction({} as any)).rejects.toThrow("Unauthorized")
    })

    it("should log security.audit on unauthorized access", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { logServerEvent } = await import("@workspace/logging/server")
      vi.mocked(getClaims).mockResolvedValue({ claims: null } as any)

      await deleteCalendarHolidaysAction({} as any).catch(swallowExpectedError)

      expect(logServerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventFamily: "security.audit",
          eventName: "unauthorized_action_attempt",
          outcome: "failure",
        })
      )
    })
  })

  describe("Input Validation", () => {
    it("should validate input with Zod schema", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { checkActionRateLimit } = await import("@workspace/supabase-data/lib/auth/rate-limit")
      vi.mocked(getClaims).mockResolvedValue({ claims: { sub: "test-user-id" } } as any)
      vi.mocked(checkActionRateLimit).mockResolvedValue(undefined)

      await expect(deleteCalendarHolidaysAction({ invalid: "data" } as any)).rejects.toThrow()
    })

    it("should accept valid input for delete operation", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { checkActionRateLimit } = await import("@workspace/supabase-data/lib/auth/rate-limit")
      const { CalendarHolidaysSupabaseRepository } = await import("@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-holidays-supabase.repository.codegen")
      vi.mocked(getClaims).mockResolvedValue({ claims: { sub: "test-user-id" } } as any)
      vi.mocked(checkActionRateLimit).mockResolvedValue(undefined)

      const { createServerAuthClient } = await import("@workspace/supabase-auth/server/create-server-auth-client")
      vi.mocked(createServerAuthClient).mockResolvedValue({} as any)
      vi.mocked(CalendarHolidaysSupabaseRepository).mockImplementation(
        function MockRepository() {
          return {
        findById: vi.fn(),
        list: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn().mockResolvedValue(undefined),
      } as any
        } as any
      )

      // TODO: Replace with actual valid input for calendar_holidays
      const validInput = {} as any

      await expect(deleteCalendarHolidaysAction(validInput)).resolves.not.toThrow()
    })

  })

  describe("Logging", () => {
    it("should log on success", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { checkActionRateLimit } = await import("@workspace/supabase-data/lib/auth/rate-limit")
      const { CalendarHolidaysSupabaseRepository } = await import("@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-holidays-supabase.repository.codegen")
      const { logServerEvent } = await import("@workspace/logging/server")
      vi.mocked(getClaims).mockResolvedValue({ claims: { sub: "test-user-id" } } as any)
      vi.mocked(checkActionRateLimit).mockResolvedValue(undefined)

      const { createServerAuthClient } = await import("@workspace/supabase-auth/server/create-server-auth-client")
      vi.mocked(createServerAuthClient).mockResolvedValue({} as any)
      vi.mocked(CalendarHolidaysSupabaseRepository).mockImplementation(
        function MockRepository() {
          return {
        findById: vi.fn(),
        list: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn().mockResolvedValue(undefined),
      } as any
        } as any
      )

      await deleteCalendarHolidaysAction({} as any).catch(swallowExpectedError)

      expect(logServerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventFamily: "action.lifecycle",
          eventName: "delete_calendar-holidays_success",
          outcome: "success",
        })
      )
    })

    it("should log on error with sanitized metadata", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { checkActionRateLimit } = await import("@workspace/supabase-data/lib/auth/rate-limit")
      const { CalendarHolidaysSupabaseRepository } = await import("@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-holidays-supabase.repository.codegen")
      const { logServerEvent } = await import("@workspace/logging/server")
      vi.mocked(getClaims).mockResolvedValue({ claims: { sub: "test-user-id" } } as any)
      vi.mocked(checkActionRateLimit).mockResolvedValue(undefined)

      const { createServerAuthClient } = await import("@workspace/supabase-auth/server/create-server-auth-client")
      vi.mocked(createServerAuthClient).mockResolvedValue({} as any)
      vi.mocked(CalendarHolidaysSupabaseRepository).mockImplementation(
        function MockRepository() {
          return {
            findById: vi.fn().mockRejectedValue(new Error("Test error")),
            list: vi.fn().mockRejectedValue(new Error("Test error")),
            insert: vi.fn().mockRejectedValue(new Error("Test error")),
            update: vi.fn().mockRejectedValue(new Error("Test error")),
            delete: vi.fn().mockRejectedValue(new Error("Test error")),
          } as any
        } as any
      )

      await deleteCalendarHolidaysAction({} as any).catch(swallowExpectedError)

      expect(logServerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventFamily: "action.lifecycle",
          eventName: "delete_calendar-holidays_failed",
          outcome: "failure",
          metadata: expect.objectContaining({
            _sanitized: true,
            _fieldCount: expect.any(Number),
          }),
        })
      )
    })
  })
})
