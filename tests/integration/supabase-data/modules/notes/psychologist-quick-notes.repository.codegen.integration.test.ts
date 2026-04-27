// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { PsychologistQuickNotesSupabaseRepository } from "@workspace/supabase-data/modules/notes/infrastructure/repositories/psychologist-quick-notes-supabase.repository.codegen"

describe.skip("psychologist-quick-notes repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void PsychologistQuickNotesSupabaseRepository
  })
})
