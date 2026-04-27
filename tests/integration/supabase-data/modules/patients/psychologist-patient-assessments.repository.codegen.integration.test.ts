// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { PsychologistPatientAssessmentsSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-assessments-supabase.repository.codegen"

describe.skip("psychologist-patient-assessments repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void PsychologistPatientAssessmentsSupabaseRepository
  })
})
