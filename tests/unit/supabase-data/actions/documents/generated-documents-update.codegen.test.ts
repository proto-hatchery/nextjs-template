import { beforeEach, describe, expect, it, vi } from "vitest"

describe("updateGeneratedDocumentsAction", () => {
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
      "@workspace/supabase-data/modules/documents/infrastructure/repositories/generated-documents-supabase.repository.codegen",
      () => ({
        GeneratedDocumentsSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { update: vi.fn().mockResolvedValue({ id: "test-id" }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { updateGeneratedDocumentsAction } =
      await import("@workspace/supabase-data/actions/documents/generated-documents-update.codegen")
    await expect(
      updateGeneratedDocumentsAction({
        id: "00000000-0000-0000-0000-000000000000",
        data: { content: "sample-content" },
      })
    ).resolves.toBeDefined()
  })
})
