/**
 * listPsychologistQuickNotesAction
 *
 * @module @workspace/supabase-data/actions/notes/psychologist-quick-notes-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistQuickNotesDTO } from "@workspace/supabase-data/modules/notes/domain/dto/psychologist-quick-notes.dto.codegen"
import type { PsychologistQuickNotesListParams } from "@workspace/supabase-data/modules/notes/domain/ports/psychologist-quick-notes-repository.port.codegen"
import { PsychologistQuickNotesSupabaseRepository } from "@workspace/supabase-data/modules/notes/infrastructure/repositories/psychologist-quick-notes-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistQuickNotesListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type PsychologistQuickNotesListInput = z.infer<typeof PsychologistQuickNotesListInputSchema>
export type PsychologistQuickNotesListOutput = { rows: PsychologistQuickNotesDTO[] }

export async function listPsychologistQuickNotesAction(
  input: PsychologistQuickNotesListInput
): Promise<PsychologistQuickNotesListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_psychologist-quick-notes" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistQuickNotesListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistQuickNotesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies PsychologistQuickNotesListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as PsychologistQuickNotesListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "notes.psychologist-quick-notes.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-quick-notes_success",
      operation: "list",
      operationType: "action",
      outcome: "success",
      metadata: {
        rowCount: result.rows.length,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "notes.psychologist-quick-notes.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-quick-notes_failed",
      operation: "list",
      operationType: "action",
      outcome: "failure",
      error,
      // @type-escape: input type is the generated Zod-inferred shape; Record<string,unknown> is required by sanitizeForAudit — diverges at the catch boundary where input may be unvalidated
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
