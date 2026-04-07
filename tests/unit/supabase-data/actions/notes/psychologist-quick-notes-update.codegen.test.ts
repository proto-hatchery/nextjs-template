/**
 * Unit tests for updatePsychologistQuickNotesAction
 * 
 * codegen:actions-hooks (generated) — do not hand-edit
 */
import { describe, expect, it, vi, beforeEach } from "vitest"

import { updatePsychologistQuickNotesAction } from "@workspace/supabase-data/actions/notes/psychologist-quick-notes-update.codegen"

vi.mock("@workspace/supabase-auth/session/get-claims", () => ({
  getClaims: vi.fn(),
}))

vi.mock("@workspace/supabase-auth/server/create-server-auth-client", () => ({
  createServerAuthClient: vi.fn(),
}))

vi.mock("@workspace/supabase-data/lib/auth/rate-limit", () => ({
  checkActionRateLimit: vi.fn(),
}))

vi.mock("@workspace/supabase-data/modules/notes/infrastructure/repositories/psychologist-quick-notes-supabase.repository.codegen", () => ({
  PsychologistQuickNotesSupabaseRepository: vi.fn(),
}))

vi.mock("@workspace/logging/server", () => ({
  logServerEvent: vi.fn(),
}))

const swallowExpectedError = (): undefined => undefined

describe("updatePsychologistQuickNotesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Authentication", () => {
    it("should throw Unauthorized when not authenticated", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      vi.mocked(getClaims).mockResolvedValue({ claims: null } as any)

      await expect(updatePsychologistQuickNotesAction({} as any)).rejects.toThrow("Unauthorized")
    })

    it("should log security.audit on unauthorized access", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { logServerEvent } = await import("@workspace/logging/server")
      vi.mocked(getClaims).mockResolvedValue({ claims: null } as any)

      await updatePsychologistQuickNotesAction({} as any).catch(swallowExpectedError)

      expect(logServerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventFamily: "security.audit",
          eventName: "unauthorized_action_attempt",
          outcome: "failure",
        })
      )
    })
  })

  describe("Input Validation", () => {
    it("should validate input with Zod schema", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { checkActionRateLimit } = await import("@workspace/supabase-data/lib/auth/rate-limit")
      vi.mocked(getClaims).mockResolvedValue({ claims: { sub: "test-user-id" } } as any)
      vi.mocked(checkActionRateLimit).mockResolvedValue(undefined)

      await expect(updatePsychologistQuickNotesAction({ invalid: "data" } as any)).rejects.toThrow()
    })

    it("should accept valid input for update operation", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { checkActionRateLimit } = await import("@workspace/supabase-data/lib/auth/rate-limit")
      const { PsychologistQuickNotesSupabaseRepository } = await import("@workspace/supabase-data/modules/notes/infrastructure/repositories/psychologist-quick-notes-supabase.repository.codegen")
      vi.mocked(getClaims).mockResolvedValue({ claims: { sub: "test-user-id" } } as any)
      vi.mocked(checkActionRateLimit).mockResolvedValue(undefined)

      const { createServerAuthClient } = await import("@workspace/supabase-auth/server/create-server-auth-client")
      vi.mocked(createServerAuthClient).mockResolvedValue({} as any)
      vi.mocked(PsychologistQuickNotesSupabaseRepository).mockImplementation(
        function MockRepository() {
          return {
        findById: vi.fn(),
        list: vi.fn(),
        insert: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: "test-id" }),
        delete: vi.fn(),
      } as any
        } as any
      )

      // TODO: Replace with actual valid input for psychologist_quick_notes
      const validInput = {} as any

      await expect(updatePsychologistQuickNotesAction(validInput)).resolves.not.toThrow()
    })

  })

  describe("Logging", () => {
    it("should log on success", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { checkActionRateLimit } = await import("@workspace/supabase-data/lib/auth/rate-limit")
      const { PsychologistQuickNotesSupabaseRepository } = await import("@workspace/supabase-data/modules/notes/infrastructure/repositories/psychologist-quick-notes-supabase.repository.codegen")
      const { logServerEvent } = await import("@workspace/logging/server")
      vi.mocked(getClaims).mockResolvedValue({ claims: { sub: "test-user-id" } } as any)
      vi.mocked(checkActionRateLimit).mockResolvedValue(undefined)

      const { createServerAuthClient } = await import("@workspace/supabase-auth/server/create-server-auth-client")
      vi.mocked(createServerAuthClient).mockResolvedValue({} as any)
      vi.mocked(PsychologistQuickNotesSupabaseRepository).mockImplementation(
        function MockRepository() {
          return {
        findById: vi.fn(),
        list: vi.fn(),
        insert: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: "test-id" }),
        delete: vi.fn(),
      } as any
        } as any
      )

      await updatePsychologistQuickNotesAction({} as any).catch(swallowExpectedError)

      expect(logServerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventFamily: "action.lifecycle",
          eventName: "update_psychologist-quick-notes_success",
          outcome: "success",
        })
      )
    })

    it("should log on error with sanitized metadata", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { checkActionRateLimit } = await import("@workspace/supabase-data/lib/auth/rate-limit")
      const { PsychologistQuickNotesSupabaseRepository } = await import("@workspace/supabase-data/modules/notes/infrastructure/repositories/psychologist-quick-notes-supabase.repository.codegen")
      const { logServerEvent } = await import("@workspace/logging/server")
      vi.mocked(getClaims).mockResolvedValue({ claims: { sub: "test-user-id" } } as any)
      vi.mocked(checkActionRateLimit).mockResolvedValue(undefined)

      const { createServerAuthClient } = await import("@workspace/supabase-auth/server/create-server-auth-client")
      vi.mocked(createServerAuthClient).mockResolvedValue({} as any)
      vi.mocked(PsychologistQuickNotesSupabaseRepository).mockImplementation(
        function MockRepository() {
          return {
            findById: vi.fn().mockRejectedValue(new Error("Test error")),
            list: vi.fn().mockRejectedValue(new Error("Test error")),
            insert: vi.fn().mockRejectedValue(new Error("Test error")),
            update: vi.fn().mockRejectedValue(new Error("Test error")),
            delete: vi.fn().mockRejectedValue(new Error("Test error")),
          } as any
        } as any
      )

      await updatePsychologistQuickNotesAction({} as any).catch(swallowExpectedError)

      expect(logServerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventFamily: "action.lifecycle",
          eventName: "update_psychologist-quick-notes_failed",
          outcome: "failure",
          metadata: expect.objectContaining({
            _sanitized: true,
            _fieldCount: expect.any(Number),
          }),
        })
      )
    })
  })
})
