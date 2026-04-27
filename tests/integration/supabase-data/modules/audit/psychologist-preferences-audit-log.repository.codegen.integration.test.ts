// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { PsychologistPreferencesAuditLogSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/psychologist-preferences-audit-log-supabase.repository.codegen"

describe.skip("psychologist-preferences-audit-log repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void PsychologistPreferencesAuditLogSupabaseRepository
  })
})
