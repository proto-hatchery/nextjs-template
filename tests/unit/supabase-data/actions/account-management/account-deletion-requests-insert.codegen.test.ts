import { beforeEach, describe, expect, it, vi } from "vitest"

describe("insertAccountDeletionRequestsAction", () => {
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
      "@workspace/supabase-data/modules/account-management/infrastructure/repositories/account-deletion-requests-supabase.repository.codegen",
      () => ({
        AccountDeletionRequestsSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { insert: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { insertAccountDeletionRequestsAction } =
      await import("@workspace/supabase-data/actions/account-management/account-deletion-requests-insert.codegen")
    await expect(
      insertAccountDeletionRequestsAction({
        requestedBy: "sample-requested-by",
        userId: "00000000-0000-0000-0000-000000000000",
      })
    ).resolves.toBeDefined()
  })
})
