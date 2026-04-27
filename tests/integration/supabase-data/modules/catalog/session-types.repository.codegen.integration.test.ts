// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { SessionTypesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/session-types-supabase.repository.codegen"

describe.skip("session-types repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void SessionTypesSupabaseRepository
  })
})
