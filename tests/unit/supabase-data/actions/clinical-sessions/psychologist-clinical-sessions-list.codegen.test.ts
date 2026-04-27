import { beforeEach, describe, expect, it, vi } from "vitest"

describe("listPsychologistClinicalSessionsAction", () => {
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
      "@workspace/supabase-data/modules/clinical-sessions/infrastructure/repositories/psychologist-clinical-sessions-supabase.repository.codegen",
      () => ({
        PsychologistClinicalSessionsSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { list: vi.fn().mockResolvedValue({ rows: [] }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { listPsychologistClinicalSessionsAction } =
      await import("@workspace/supabase-data/actions/clinical-sessions/psychologist-clinical-sessions-list.codegen")
    await expect(listPsychologistClinicalSessionsAction({})).resolves.toBeDefined()
  })
})
