/**
 * insertPsychologistAssistantsAction
 *
 * @module @workspace/supabase-data/actions/assistants/psychologist-assistants-insert.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistAssistantsDTO } from "@workspace/supabase-data/modules/assistants/domain/dto/psychologist-assistants.dto.codegen"
import { PsychologistAssistantsSupabaseRepository } from "@workspace/supabase-data/modules/assistants/infrastructure/repositories/psychologist-assistants-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistAssistantsInsertInputSchema = z.object({
  assistantId: z.uuid({ error: "Invalid UUID" }),
  metadata: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  psychologistId: z.uuid({ error: "Invalid UUID" }),
  revokedAt: z.string().nullable().optional(),
})

export type PsychologistAssistantsInsertInput = z.infer<
  typeof PsychologistAssistantsInsertInputSchema
>
export type PsychologistAssistantsInsertOutput = PsychologistAssistantsDTO

export async function insertPsychologistAssistantsAction(
  input: PsychologistAssistantsInsertInput
): Promise<PsychologistAssistantsInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_psychologist-assistants" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistAssistantsInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistAssistantsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistAssistantsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistAssistantsDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "assistants.psychologist-assistants.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-assistants_success",
      operation: "insert",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? null,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "assistants.psychologist-assistants.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-assistants_failed",
      operation: "insert",
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
