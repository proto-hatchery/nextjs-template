import { beforeEach, describe, expect, it, vi } from "vitest"

describe("listTherapeuticSessionEventsAction", () => {
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
      "@workspace/supabase-data/modules/clinical-sessions/infrastructure/repositories/therapeutic-session-events-supabase.repository.codegen",
      () => ({
        TherapeuticSessionEventsSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { list: vi.fn().mockResolvedValue({ rows: [] }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { listTherapeuticSessionEventsAction } =
      await import("@workspace/supabase-data/actions/clinical-sessions/therapeutic-session-events-list.codegen")
    await expect(listTherapeuticSessionEventsAction({})).resolves.toBeDefined()
  })
})
