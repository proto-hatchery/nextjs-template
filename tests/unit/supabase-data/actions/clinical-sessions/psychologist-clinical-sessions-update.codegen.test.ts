import { beforeEach, describe, expect, it, vi } from "vitest"

describe("updatePsychologistClinicalSessionsAction", () => {
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
            return { update: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { updatePsychologistClinicalSessionsAction } =
      await import("@workspace/supabase-data/actions/clinical-sessions/psychologist-clinical-sessions-update.codegen")
    await expect(
      updatePsychologistClinicalSessionsAction({
        id: "00000000-0000-0000-0000-000000000000",
        data: { attendanceConfirmed: true },
      })
    ).resolves.toBeDefined()
  })
})
