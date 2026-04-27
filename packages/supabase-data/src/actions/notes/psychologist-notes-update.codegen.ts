/**
 * updatePsychologistNotesAction
 *
 * @module @workspace/supabase-data/actions/notes/psychologist-notes-update.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistNotesDTO } from "@workspace/supabase-data/modules/notes/domain/dto/psychologist-notes.dto.codegen"
import { PsychologistNotesSupabaseRepository } from "@workspace/supabase-data/modules/notes/infrastructure/repositories/psychologist-notes-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistNotesUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      content: z.string().nullable().optional(),
      createdBy: z.string().nullable().optional(),
      encodedContent: z.string().optional(),
      isArchived: z.boolean().nullable().optional(),
      noteType: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
      parentNoteId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      patientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      psychologistClientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      psychologistId: z.uuid({ error: "Invalid UUID" }).optional(),
      sessionId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      tags: z.array(z.string()).nullable().optional(),
      title: z.string().nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type PsychologistNotesUpdateInput = z.infer<typeof PsychologistNotesUpdateInputSchema>
export type PsychologistNotesUpdateOutput = PsychologistNotesDTO

export async function updatePsychologistNotesAction(
  input: PsychologistNotesUpdateInput
): Promise<PsychologistNotesUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_psychologist-notes" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistNotesUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistNotesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistNotesDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistNotesDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "notes.psychologist-notes.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-notes_success",
      operation: "update",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? validated.id,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "notes.psychologist-notes.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-notes_failed",
      operation: "update",
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
