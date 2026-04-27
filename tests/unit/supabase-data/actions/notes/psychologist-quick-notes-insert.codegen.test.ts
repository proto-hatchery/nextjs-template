import { beforeEach, describe, expect, it, vi } from "vitest"

describe("insertPsychologistQuickNotesAction", () => {
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
      "@workspace/supabase-data/modules/notes/infrastructure/repositories/psychologist-quick-notes-supabase.repository.codegen",
      () => ({
        PsychologistQuickNotesSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { insert: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { insertPsychologistQuickNotesAction } =
      await import("@workspace/supabase-data/actions/notes/psychologist-quick-notes-insert.codegen")
    await expect(
      insertPsychologistQuickNotesAction({
        psychologistId: "00000000-0000-0000-0000-000000000000",
        title: "sample-title",
      })
    ).resolves.toBeDefined()
  })
})
