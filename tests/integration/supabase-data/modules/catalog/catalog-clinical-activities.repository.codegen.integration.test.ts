// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { CatalogClinicalActivitiesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/catalog-clinical-activities-supabase.repository.codegen"

describe.skip("catalog-clinical-activities repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void CatalogClinicalActivitiesSupabaseRepository
  })
})
