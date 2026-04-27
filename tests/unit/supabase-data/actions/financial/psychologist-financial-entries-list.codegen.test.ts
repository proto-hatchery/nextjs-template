import { beforeEach, describe, expect, it, vi } from "vitest"

describe("listPsychologistFinancialEntriesAction", () => {
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
      "@workspace/supabase-data/modules/financial/infrastructure/repositories/psychologist-financial-entries-supabase.repository.codegen",
      () => ({
        PsychologistFinancialEntriesSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { list: vi.fn().mockResolvedValue({ rows: [] }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { listPsychologistFinancialEntriesAction } =
      await import("@workspace/supabase-data/actions/financial/psychologist-financial-entries-list.codegen")
    await expect(listPsychologistFinancialEntriesAction({})).resolves.toBeDefined()
  })
})
