import { beforeEach, describe, expect, it, vi } from "vitest"

describe("updateCalendarEventSeriesAction", () => {
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
      "@workspace/supabase-data/modules/calendar/infrastructure/repositories/calendar-event-series-supabase.repository.codegen",
      () => ({
        CalendarEventSeriesSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { update: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { updateCalendarEventSeriesAction } =
      await import("@workspace/supabase-data/actions/calendar/calendar-event-series-update.codegen")
    await expect(
      updateCalendarEventSeriesAction({
        id: "00000000-0000-0000-0000-000000000000",
        data: { allDay: true },
      })
    ).resolves.toBeDefined()
  })
})
