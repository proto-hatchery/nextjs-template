import { beforeEach, describe, expect, it, vi } from "vitest"

describe("updatePsychologistAssistantsAction", () => {
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
      "@workspace/supabase-data/modules/assistants/infrastructure/repositories/psychologist-assistants-supabase.repository.codegen",
      () => ({
        PsychologistAssistantsSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { update: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { updatePsychologistAssistantsAction } =
      await import("@workspace/supabase-data/actions/assistants/psychologist-assistants-update.codegen")
    await expect(
      updatePsychologistAssistantsAction({
        id: "00000000-0000-0000-0000-000000000000",
        data: { assistantId: "00000000-0000-0000-0000-000000000000" },
      })
    ).resolves.toBeDefined()
  })
})
