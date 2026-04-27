// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { PsychologistPatientActivitiesSupabaseRepository } from "@workspace/supabase-data/modules/patients/infrastructure/repositories/psychologist-patient-activities-supabase.repository.codegen"

describe.skip("psychologist-patient-activities repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void PsychologistPatientActivitiesSupabaseRepository
  })
})
