import { beforeEach, describe, expect, it, vi } from "vitest"

describe("updatePsychologistOnboardingStateAction", () => {
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
      "@workspace/supabase-data/modules/onboarding/infrastructure/repositories/psychologist-onboarding-state-supabase.repository.codegen",
      () => ({
        PsychologistOnboardingStateSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { update: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { updatePsychologistOnboardingStateAction } =
      await import("@workspace/supabase-data/actions/onboarding/psychologist-onboarding-state-update.codegen")
    await expect(
      updatePsychologistOnboardingStateAction({
        psychologistId: "00000000-0000-0000-0000-000000000000",
        data: { abandonedAt: "sample-abandoned-at" },
      })
    ).resolves.toBeDefined()
  })
})
