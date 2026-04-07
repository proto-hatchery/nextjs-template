/**
 * Unit tests for useAuditLogsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useAuditLogsQuery } from "@workspace/supabase-data/hooks/audit/use-audit-logs-query.hook.codegen"
import { auditQueryKeys } from "@workspace/supabase-data/hooks/audit/query-keys.codegen"

describe("useAuditLogsQuery", () => {
  it("should export the generated hook", () => {
    expect(useAuditLogsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(auditQueryKeys.auditLogsList({})).toBeDefined()
  })
})
