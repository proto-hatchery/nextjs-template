// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { PsychologistPatientGuardianDocumentsSupabaseRepository } from "@workspace/supabase-data/modules/documents/infrastructure/repositories/psychologist-patient-guardian-documents-supabase.repository.codegen"

describe.skip("psychologist-patient-guardian-documents repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void PsychologistPatientGuardianDocumentsSupabaseRepository
  })
})
