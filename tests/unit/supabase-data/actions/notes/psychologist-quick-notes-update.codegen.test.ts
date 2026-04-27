import { beforeEach, describe, expect, it, vi } from "vitest"

describe("updatePsychologistQuickNotesAction", () => {
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
            return { update: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { updatePsychologistQuickNotesAction } =
      await import("@workspace/supabase-data/actions/notes/psychologist-quick-notes-update.codegen")
    await expect(
      updatePsychologistQuickNotesAction({
        id: "00000000-0000-0000-0000-000000000000",
        data: { completedAt: "sample-completed-at" },
      })
    ).resolves.toBeDefined()
  })
})
