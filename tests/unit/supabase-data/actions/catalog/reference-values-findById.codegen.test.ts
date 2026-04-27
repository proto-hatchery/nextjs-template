import { beforeEach, describe, expect, it, vi } from "vitest"

describe("findByIdReferenceValuesAction", () => {
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
      "@workspace/supabase-data/modules/catalog/infrastructure/repositories/reference-values-supabase.repository.codegen",
      () => ({
        ReferenceValuesSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { findById: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { findByIdReferenceValuesAction } =
      await import("@workspace/supabase-data/actions/catalog/reference-values-findById.codegen")
    await expect(
      findByIdReferenceValuesAction({
        id: "00000000-0000-0000-0000-000000000000",
      })
    ).resolves.toBeDefined()
  })
})
