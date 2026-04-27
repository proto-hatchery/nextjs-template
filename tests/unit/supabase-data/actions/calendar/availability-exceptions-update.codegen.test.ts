import { beforeEach, describe, expect, it, vi } from "vitest"

describe("updateAvailabilityExceptionsAction", () => {
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
      "@workspace/supabase-data/modules/calendar/infrastructure/repositories/availability-exceptions-supabase.repository.codegen",
      () => ({
        AvailabilityExceptionsSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { update: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { updateAvailabilityExceptionsAction } =
      await import("@workspace/supabase-data/actions/calendar/availability-exceptions-update.codegen")
    await expect(
      updateAvailabilityExceptionsAction({
        id: "00000000-0000-0000-0000-000000000000",
        data: { endTime: "sample-end-time" },
      })
    ).resolves.toBeDefined()
  })
})
