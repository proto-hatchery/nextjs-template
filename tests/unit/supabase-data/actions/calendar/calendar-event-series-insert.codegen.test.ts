import { beforeEach, describe, expect, it, vi } from "vitest"

describe("insertCalendarEventSeriesAction", () => {
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
            return { insert: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { insertCalendarEventSeriesAction } =
      await import("@workspace/supabase-data/actions/calendar/calendar-event-series-insert.codegen")
    await expect(
      insertCalendarEventSeriesAction({
        effectiveStart: "sample-effective-start",
        endTime: "sample-end-time",
        eventType: "sample-event-type",
        psychologistId: "00000000-0000-0000-0000-000000000000",
        rrule: "sample-rrule",
        startTime: "sample-start-time",
        title: "sample-title",
      })
    ).resolves.toBeDefined()
  })
})
