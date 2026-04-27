// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { PsychologistPatientGuardiansSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-guardians-supabase.repository.codegen"

describe.skip("psychologist-patient-guardians repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void PsychologistPatientGuardiansSupabaseRepository
  })
})
