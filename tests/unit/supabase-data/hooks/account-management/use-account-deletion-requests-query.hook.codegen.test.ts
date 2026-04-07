/**
 * Unit tests for useAccountDeletionRequestsQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useAccountDeletionRequestsQuery } from "@workspace/supabase-data/hooks/account-management/use-account-deletion-requests-query.hook.codegen"
import { accountManagementQueryKeys } from "@workspace/supabase-data/hooks/account-management/query-keys.codegen"

describe("useAccountDeletionRequestsQuery", () => {
  it("should export the generated hook", () => {
    expect(useAccountDeletionRequestsQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(accountManagementQueryKeys.accountDeletionRequestsList({})).toBeDefined()
  })
})
