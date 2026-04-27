import { beforeEach, describe, expect, it, vi } from "vitest"

describe("listAccountDeletionRequestsAction", () => {
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
            return { list: vi.fn().mockResolvedValue({ rows: [] }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { listAccountDeletionRequestsAction } =
      await import("@workspace/supabase-data/actions/account-management/account-deletion-requests-list.codegen")
    await expect(listAccountDeletionRequestsAction({})).resolves.toBeDefined()
  })
})
