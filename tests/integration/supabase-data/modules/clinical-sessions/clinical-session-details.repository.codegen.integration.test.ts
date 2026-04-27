// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { ClinicalSessionDetailsSupabaseRepository } from "@workspace/supabase-data/modules/clinical-sessions/infrastructure/repositories/clinical-session-details-supabase.repository.codegen"

describe.skip("clinical-session-details repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void ClinicalSessionDetailsSupabaseRepository
  })
})
