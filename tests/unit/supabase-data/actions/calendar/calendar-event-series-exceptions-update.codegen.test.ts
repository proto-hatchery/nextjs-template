import { beforeEach, describe, expect, it, vi } from "vitest"

describe("updateCalendarEventSeriesExceptionsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("accepts valid input", async () => {
    vi.doMock("@workspace/supabase-data/lib/auth/require-auth", () => ({
      requireAuth: vi.fn().mockResolvedValue({
        claims: { app_metadata: {}, sub: "test-user-id", user_metadata: {} },
        userId: "test-user-id",
      }),
    }))
    vi.doMock("@workspace/supabase-auth/server/create-server-auth-client", () => ({
      createServerAuthClient: vi.fn().mockResolvedValue({}),
    }))

    vi.doMock(
      "@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-event-series-exceptions-supabase.repository.codegen",
      () => ({
        CalendarEventSeriesExceptionsSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { update: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { updateCalendarEventSeriesExceptionsAction } =
      await import("@workspace/supabase-data/actions/calendar/calendar-event-series-exceptions-update.codegen")
    await expect(
      updateCalendarEventSeriesExceptionsAction({
        id: "00000000-0000-0000-0000-000000000000",
        data: { exceptionType: "sample-exception-type" },
      })
    ).resolves.toBeDefined()
  })
})
