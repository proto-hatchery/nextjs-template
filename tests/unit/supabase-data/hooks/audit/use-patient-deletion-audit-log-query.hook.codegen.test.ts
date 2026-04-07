/**
 * Unit tests for usePatientDeletionAuditLogQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePatientDeletionAuditLogQuery } from "@workspace/supabase-data/hooks/audit/use-patient-deletion-audit-log-query.hook.codegen"
import { auditQueryKeys } from "@workspace/supabase-data/hooks/audit/query-keys.codegen"

describe("usePatientDeletionAuditLogQuery", () => {
  it("should export the generated hook", () => {
    expect(usePatientDeletionAuditLogQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(auditQueryKeys.patientDeletionAuditLogList({})).toBeDefined()
  })
})
