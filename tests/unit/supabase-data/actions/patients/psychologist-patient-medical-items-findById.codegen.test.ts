import { beforeEach, describe, expect, it, vi } from "vitest"

describe("findByIdPsychologistPatientMedicalItemsAction", () => {
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
      "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-medical-items-supabase.repository.codegen",
      () => ({
        PsychologistPatientMedicalItemsSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { findById: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { findByIdPsychologistPatientMedicalItemsAction } =
      await import("@workspace/supabase-data/actions/patients/psychologist-patient-medical-items-findById.codegen")
    await expect(
      findByIdPsychologistPatientMedicalItemsAction({
        id: "00000000-0000-0000-0000-000000000000",
      })
    ).resolves.toBeDefined()
  })
})
