// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { BusySlotsSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/busy-slots-supabase.repository.codegen"

describe.skip("busy-slots repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void BusySlotsSupabaseRepository
  })
})
