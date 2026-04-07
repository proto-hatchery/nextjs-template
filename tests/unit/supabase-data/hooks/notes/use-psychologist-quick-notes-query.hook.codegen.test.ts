/**
 * Unit tests for usePsychologistQuickNotesQuery
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it } from "vitest"

import { usePsychologistQuickNotesQuery } from "@workspace/supabase-data/hooks/notes/use-psychologist-quick-notes-query.hook.codegen"
import { notesQueryKeys } from "@workspace/supabase-data/hooks/notes/query-keys.codegen"

describe("usePsychologistQuickNotesQuery", () => {
  it("should export the generated hook", () => {
    expect(usePsychologistQuickNotesQuery).toBeTypeOf("function")
  })

  it("should expose a query key factory for the generated hook", () => {
    expect(notesQueryKeys.psychologistQuickNotesList({})).toBeDefined()
  })
})
