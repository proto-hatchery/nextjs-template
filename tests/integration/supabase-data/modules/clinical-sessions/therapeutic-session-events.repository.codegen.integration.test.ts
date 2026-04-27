// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { TherapeuticSessionEventsSupabaseRepository } from "@workspace/supabase-data/modules/clinical-sessions/infrastructure/repositories/therapeutic-session-events-supabase.repository.codegen"

describe.skip("therapeutic-session-events repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void TherapeuticSessionEventsSupabaseRepository
  })
})
