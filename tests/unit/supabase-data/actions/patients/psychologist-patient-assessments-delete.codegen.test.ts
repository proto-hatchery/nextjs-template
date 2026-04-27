import { beforeEach, describe, expect, it, vi } from "vitest"

describe("deletePsychologistPatientAssessmentsAction", () => {
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
      "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-assessments-supabase.repository.codegen",
      () => ({
        PsychologistPatientAssessmentsSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { delete: vi.fn().mockResolvedValue(undefined) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { deletePsychologistPatientAssessmentsAction } =
      await import("@workspace/supabase-data/actions/patients/psychologist-patient-assessments-delete.codegen")
    await expect(
      deletePsychologistPatientAssessmentsAction({
        id: "00000000-0000-0000-0000-000000000000",
      })
    ).resolves.toBeDefined()
  })
})
