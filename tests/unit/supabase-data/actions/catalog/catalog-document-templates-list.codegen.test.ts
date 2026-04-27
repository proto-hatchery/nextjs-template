import { beforeEach, describe, expect, it, vi } from "vitest"

describe("listCatalogDocumentTemplatesAction", () => {
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
      "@workspace/supabase-data/modules/catalog/infrastructure/repositories/catalog-document-templates-supabase.repository.codegen",
      () => ({
        CatalogDocumentTemplatesSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { list: vi.fn().mockResolvedValue({ rows: [] }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { listCatalogDocumentTemplatesAction } =
      await import("@workspace/supabase-data/actions/catalog/catalog-document-templates-list.codegen")
    await expect(listCatalogDocumentTemplatesAction({})).resolves.toBeDefined()
  })
})
