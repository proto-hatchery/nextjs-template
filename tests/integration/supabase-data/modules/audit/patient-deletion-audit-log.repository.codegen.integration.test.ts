// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { PatientDeletionAuditLogSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/patient-deletion-audit-log-supabase.repository.codegen"

describe.skip("patient-deletion-audit-log repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void PatientDeletionAuditLogSupabaseRepository
  })
})
