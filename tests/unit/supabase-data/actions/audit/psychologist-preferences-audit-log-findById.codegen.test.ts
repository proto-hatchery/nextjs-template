import { beforeEach, describe, expect, it, vi } from "vitest"

describe("findByIdPsychologistPreferencesAuditLogAction", () => {
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
      "@workspace/supabase-data/modules/audit/infrastructure/repositories/psychologist-preferences-audit-log-supabase.repository.codegen",
      () => ({
        PsychologistPreferencesAuditLogSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { findById: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { findByIdPsychologistPreferencesAuditLogAction } =
      await import("@workspace/supabase-data/actions/audit/psychologist-preferences-audit-log-findById.codegen")
    await expect(
      findByIdPsychologistPreferencesAuditLogAction({
        id: "00000000-0000-0000-0000-000000000000",
      })
    ).resolves.toBeDefined()
  })
})
