import { beforeEach, describe, expect, it, vi } from "vitest"

describe("deletePsychologistPatientGuardianDocumentsAction", () => {
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
      "@workspace/supabase-data/modules/documents/infrastructure/repositories/psychologist-patient-guardian-documents-supabase.repository.codegen",
      () => ({
        PsychologistPatientGuardianDocumentsSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { delete: vi.fn().mockResolvedValue(undefined) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { deletePsychologistPatientGuardianDocumentsAction } =
      await import("@workspace/supabase-data/actions/documents/psychologist-patient-guardian-documents-delete.codegen")
    await expect(
      deletePsychologistPatientGuardianDocumentsAction({
        id: "00000000-0000-0000-0000-000000000000",
      })
    ).resolves.toBeDefined()
  })
})
