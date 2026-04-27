import { beforeEach, describe, expect, it, vi } from "vitest"

describe("updatePsychologistPatientEmergencyContactsAction", () => {
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
      "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-emergency-contacts-supabase.repository.codegen",
      () => ({
        PsychologistPatientEmergencyContactsSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { update: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { updatePsychologistPatientEmergencyContactsAction } =
      await import("@workspace/supabase-data/actions/patients/psychologist-patient-emergency-contacts-update.codegen")
    await expect(
      updatePsychologistPatientEmergencyContactsAction({
        id: "00000000-0000-0000-0000-000000000000",
        data: { contactName: "sample-contact-name" },
      })
    ).resolves.toBeDefined()
  })
})
