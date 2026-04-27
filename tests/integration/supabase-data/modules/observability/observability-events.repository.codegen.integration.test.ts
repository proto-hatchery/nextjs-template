// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { ObservabilityEventsSupabaseRepository } from "@workspace/supabase-data/modules/observability/infrastructure/repositories/observability-events-supabase.repository.codegen"

describe.skip("observability-events repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void ObservabilityEventsSupabaseRepository
  })
})
