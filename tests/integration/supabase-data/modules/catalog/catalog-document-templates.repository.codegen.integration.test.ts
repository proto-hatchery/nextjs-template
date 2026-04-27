// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { CatalogDocumentTemplatesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/catalog-document-templates-supabase.repository.codegen"

describe.skip("catalog-document-templates repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void CatalogDocumentTemplatesSupabaseRepository
  })
})
