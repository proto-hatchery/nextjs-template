import { beforeEach, describe, expect, it, vi } from "vitest"

describe("insertGoogleCalendarConnectionsAction", () => {
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
            return { insert: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { insertGoogleCalendarConnectionsAction } =
      await import("@workspace/supabase-data/actions/google-calendar/google-calendar-connections-insert.codegen")
    await expect(
      insertGoogleCalendarConnectionsAction({
        googleEmail: "sample-google-email",
        psychologistId: "00000000-0000-0000-0000-000000000000",
        tokenExpiresAt: "sample-token-expires-at",
      })
    ).resolves.toBeDefined()
  })
})
