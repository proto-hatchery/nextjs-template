import { beforeEach, describe, expect, it, vi } from "vitest"

describe("insertPsychologistPatientServicesAction", () => {
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
      "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-services-supabase.repository.codegen",
      () => ({
        PsychologistPatientServicesSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { insert: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { insertPsychologistPatientServicesAction } =
      await import("@workspace/supabase-data/actions/patients/psychologist-patient-services-insert.codegen")
    await expect(
      insertPsychologistPatientServicesAction({
        psychologistId: "00000000-0000-0000-0000-000000000000",
        psychologistPatientId: "00000000-0000-0000-0000-000000000000",
      })
    ).resolves.toBeDefined()
  })
})
