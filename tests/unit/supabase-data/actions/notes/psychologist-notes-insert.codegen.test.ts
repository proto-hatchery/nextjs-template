import { beforeEach, describe, expect, it, vi } from "vitest"

describe("insertPsychologistNotesAction", () => {
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
      "@workspace/supabase-data/modules/notes/infrastructure/repositories/psychologist-notes-supabase.repository.codegen",
      () => ({
        PsychologistNotesSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { insert: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { insertPsychologistNotesAction } =
      await import("@workspace/supabase-data/actions/notes/psychologist-notes-insert.codegen")
    await expect(
      insertPsychologistNotesAction({
        psychologistId: "00000000-0000-0000-0000-000000000000",
      })
    ).resolves.toBeDefined()
  })
})
