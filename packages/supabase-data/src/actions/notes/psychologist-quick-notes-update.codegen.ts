/**
 * updatePsychologistQuickNotesAction
 *
 * @module @workspace/supabase-data/actions/notes/psychologist-quick-notes-update.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistQuickNotesDTO } from "@workspace/supabase-data/modules/notes/domain/dto/psychologist-quick-notes.dto.codegen"
import { PsychologistQuickNotesSupabaseRepository } from "@workspace/supabase-data/modules/notes/infrastructure/repositories/psychologist-quick-notes-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistQuickNotesUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      completedAt: z.string().nullable().optional(),
      dueDate: z.string().nullable().optional(),
      isCompleted: z.boolean().optional(),
      priority: z.string().optional(),
      psychologistId: z.uuid({ error: "Invalid UUID" }).optional(),
      title: z.string().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type PsychologistQuickNotesUpdateInput = z.infer<
  typeof PsychologistQuickNotesUpdateInputSchema
>
export type PsychologistQuickNotesUpdateOutput = PsychologistQuickNotesDTO

export async function updatePsychologistQuickNotesAction(
  input: PsychologistQuickNotesUpdateInput
): Promise<PsychologistQuickNotesUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_psychologist-quick-notes" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistQuickNotesUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistQuickNotesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistQuickNotesDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistQuickNotesDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "notes.psychologist-quick-notes.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-quick-notes_success",
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
      component: "notes.psychologist-quick-notes.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_psychologist-quick-notes_failed",
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
