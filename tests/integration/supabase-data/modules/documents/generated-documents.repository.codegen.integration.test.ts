// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { GeneratedDocumentsSupabaseRepository } from "@workspace/supabase-data/modules/documents/infrastructure/repositories/generated-documents-supabase.repository.codegen"

describe.skip("generated-documents repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void GeneratedDocumentsSupabaseRepository
  })
})
