import { beforeEach, describe, expect, it, vi } from "vitest"

describe("updatePsychologistPatientChargesAction", () => {
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
      "@workspace/supabase-data/modules/financial/infrastructure/repositories/psychologist-patient-charges-supabase.repository.codegen",
      () => ({
        PsychologistPatientChargesSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { update: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { updatePsychologistPatientChargesAction } =
      await import("@workspace/supabase-data/actions/financial/psychologist-patient-charges-update.codegen")
    await expect(
      updatePsychologistPatientChargesAction({
        id: "00000000-0000-0000-0000-000000000000",
        data: { attachmentUrl: "sample-attachment-url" },
      })
    ).resolves.toBeDefined()
  })
})
