// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { describe, it } from "vitest"

import { GoogleCalendarConnectionsSupabaseRepository } from "@workspace/supabase-data/modules/google-calendar/infrastructure/repositories/google-calendar-connections-supabase.repository.codegen"

describe.skip("google-calendar-connections repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void GoogleCalendarConnectionsSupabaseRepository
  })
})
