import { beforeEach, describe, expect, it, vi } from "vitest"

describe("insertPsychologistPatientGuardianDocumentsAction", () => {
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
            return { insert: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { insertPsychologistPatientGuardianDocumentsAction } =
      await import("@workspace/supabase-data/actions/documents/psychologist-patient-guardian-documents-insert.codegen")
    await expect(
      insertPsychologistPatientGuardianDocumentsAction({
        documentType: "sample-document-type",
        fileName: "sample-file-name",
        psychologistId: "00000000-0000-0000-0000-000000000000",
        title: "sample-title",
      })
    ).resolves.toBeDefined()
  })
})
