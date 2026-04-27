import { beforeEach, describe, expect, it, vi } from "vitest"

describe("insertPsychologistPreferencesAction", () => {
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
      "@workspace/supabase-data/modules/preferences/infrastructure/repositories/psychologist-preferences-supabase.repository.codegen",
      () => ({
        PsychologistPreferencesSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { insert: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { insertPsychologistPreferencesAction } =
      await import("@workspace/supabase-data/actions/preferences/psychologist-preferences-insert.codegen")
    await expect(insertPsychologistPreferencesAction({})).resolves.toBeDefined()
  })
})
