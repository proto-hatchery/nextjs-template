// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { AccountDeletionRequestsSupabaseRepository } from "@workspace/supabase-data/modules/account-management/infrastructure/repositories/account-deletion-requests-supabase.repository.codegen"

describe.skip("account-deletion-requests repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void AccountDeletionRequestsSupabaseRepository
  })
})
