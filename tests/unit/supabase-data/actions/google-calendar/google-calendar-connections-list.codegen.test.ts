import { beforeEach, describe, expect, it, vi } from "vitest"

describe("listGoogleCalendarConnectionsAction", () => {
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
      "@workspace/supabase-data/modules/google-calendar/infrastructure/repositories/google-calendar-connections-supabase.repository.codegen",
      () => ({
        GoogleCalendarConnectionsSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { list: vi.fn().mockResolvedValue({ rows: [] }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { listGoogleCalendarConnectionsAction } =
      await import("@workspace/supabase-data/actions/google-calendar/google-calendar-connections-list.codegen")
    await expect(listGoogleCalendarConnectionsAction({})).resolves.toBeDefined()
  })
})
