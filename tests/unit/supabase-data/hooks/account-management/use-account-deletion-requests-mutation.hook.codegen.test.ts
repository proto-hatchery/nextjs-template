/**
 * Unit tests for useAccountDeletionRequestsMutation
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { useAccountDeletionRequestsMutation } from "@workspace/supabase-data/hooks/account-management/use-account-deletion-requests-mutation.hook.codegen"
import { accountManagementQueryKeys } from "@workspace/supabase-data/hooks/account-management/query-keys.codegen"

describe("useAccountDeletionRequestsMutation", () => {
  it("should export the generated hook", () => {
    expect(useAccountDeletionRequestsMutation).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(accountManagementQueryKeys.accountDeletionRequests()).toBeDefined()
  })
})
