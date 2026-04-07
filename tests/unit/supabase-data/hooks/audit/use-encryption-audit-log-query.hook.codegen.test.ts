/**
 * Unit tests for useEncryptionAuditLogQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useEncryptionAuditLogQuery } from "@workspace/supabase-data/hooks/audit/use-encryption-audit-log-query.hook.codegen"
import { auditQueryKeys } from "@workspace/supabase-data/hooks/audit/query-keys.codegen"

describe("useEncryptionAuditLogQuery", () => {
  it("should export the generated hook", () => {
    expect(useEncryptionAuditLogQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(auditQueryKeys.encryptionAuditLogList({})).toBeDefined()
  })
})
