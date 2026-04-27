// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { PsychologistInvoicesSupabaseRepository } from "@workspace/supabase-data/modules/financial/infrastructure/repositories/psychologist-invoices-supabase.repository.codegen"

describe.skip("psychologist-invoices repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void PsychologistInvoicesSupabaseRepository
  })
})
