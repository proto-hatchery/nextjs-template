import { beforeEach, describe, expect, it, vi } from "vitest"

describe("listPsychologistServicesAction", () => {
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
      "@workspace/supabase-data/modules/preferences/infrastructure/repositories/psychologist-services-supabase.repository.codegen",
      () => ({
        PsychologistServicesSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { list: vi.fn().mockResolvedValue({ rows: [] }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { listPsychologistServicesAction } =
      await import("@workspace/supabase-data/actions/preferences/psychologist-services-list.codegen")
    await expect(listPsychologistServicesAction({})).resolves.toBeDefined()
  })
})
