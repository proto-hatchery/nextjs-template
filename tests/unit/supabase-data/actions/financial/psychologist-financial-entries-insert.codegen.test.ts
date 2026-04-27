import { beforeEach, describe, expect, it, vi } from "vitest"

describe("insertPsychologistFinancialEntriesAction", () => {
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
            return { insert: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { insertPsychologistFinancialEntriesAction } =
      await import("@workspace/supabase-data/actions/financial/psychologist-financial-entries-insert.codegen")
    await expect(
      insertPsychologistFinancialEntriesAction({
        psychologistId: "00000000-0000-0000-0000-000000000000",
        type: "sample-type",
      })
    ).resolves.toBeDefined()
  })
})
