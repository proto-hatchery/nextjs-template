import { beforeEach, describe, expect, it, vi } from "vitest"

describe("listPsychologistPreferencesAuditLogAction", () => {
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
            return { list: vi.fn().mockResolvedValue({ rows: [] }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { listPsychologistPreferencesAuditLogAction } =
      await import("@workspace/supabase-data/actions/audit/psychologist-preferences-audit-log-list.codegen")
    await expect(listPsychologistPreferencesAuditLogAction({})).resolves.toBeDefined()
  })
})
