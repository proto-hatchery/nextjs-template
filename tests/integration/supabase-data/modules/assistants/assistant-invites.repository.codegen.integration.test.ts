// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { AssistantInvitesSupabaseRepository } from "@workspace/supabase-data/modules/assistants/infrastructure/repositories/assistant-invites-supabase.repository.codegen"

describe.skip("assistant-invites repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void AssistantInvitesSupabaseRepository
  })
})
