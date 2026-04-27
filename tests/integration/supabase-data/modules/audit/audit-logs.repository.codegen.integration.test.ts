// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { AuditLogsSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/audit-logs-supabase.repository.codegen"

describe.skip("audit-logs repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void AuditLogsSupabaseRepository
  })
})
