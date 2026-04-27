// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { EncryptionAuditLogSupabaseRepository } from "@workspace/supabase-data/modules/audit/infrastructure/repositories/encryption-audit-log-supabase.repository.codegen"

describe.skip("encryption-audit-log repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void EncryptionAuditLogSupabaseRepository
  })
})
