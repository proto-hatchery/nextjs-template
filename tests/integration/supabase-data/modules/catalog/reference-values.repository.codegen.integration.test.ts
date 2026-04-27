// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { ReferenceValuesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/reference-values-supabase.repository.codegen"

describe.skip("reference-values repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void ReferenceValuesSupabaseRepository
  })
})
