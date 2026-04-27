// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { PsychologistPatientChargesSupabaseRepository } from "@workspace/supabase-data/modules/financial/infrastructure/repositories/psychologist-patient-charges-supabase.repository.codegen"

describe.skip("psychologist-patient-charges repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void PsychologistPatientChargesSupabaseRepository
  })
})
