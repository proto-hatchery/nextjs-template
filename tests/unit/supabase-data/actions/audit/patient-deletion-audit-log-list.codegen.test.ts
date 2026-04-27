import { beforeEach, describe, expect, it, vi } from "vitest"

describe("listPatientDeletionAuditLogAction", () => {
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
      "@workspace/supabase-data/modules/audit/infrastructure/repositories/patient-deletion-audit-log-supabase.repository.codegen",
      () => ({
        PatientDeletionAuditLogSupabaseRepository: class MockGeneratedRepository {
          constructor() {
            return { list: vi.fn().mockResolvedValue({ rows: [] }) }
          }
        },
      })
    )

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { listPatientDeletionAuditLogAction } =
      await import("@workspace/supabase-data/actions/audit/patient-deletion-audit-log-list.codegen")
    await expect(listPatientDeletionAuditLogAction({})).resolves.toBeDefined()
  })
})
