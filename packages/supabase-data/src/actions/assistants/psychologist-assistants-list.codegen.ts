/**
 * listPsychologistAssistantsAction
 *
 * @module @workspace/supabase-data/actions/assistants/psychologist-assistants-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistAssistantsDTO } from "@workspace/supabase-data/modules/assistants/domain/dto/psychologist-assistants.dto.codegen"
import type { PsychologistAssistantsListParams } from "@workspace/supabase-data/modules/assistants/domain/ports/psychologist-assistants-repository.port.codegen"
import { PsychologistAssistantsSupabaseRepository } from "@workspace/supabase-data/modules/assistants/infrastructure/repositories/psychologist-assistants-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistAssistantsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type PsychologistAssistantsListInput = z.infer<typeof PsychologistAssistantsListInputSchema>
export type PsychologistAssistantsListOutput = { rows: PsychologistAssistantsDTO[] }

export async function listPsychologistAssistantsAction(
  input: PsychologistAssistantsListInput
): Promise<PsychologistAssistantsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_psychologist-assistants" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistAssistantsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistAssistantsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies PsychologistAssistantsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as PsychologistAssistantsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "assistants.psychologist-assistants.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-assistants_success",
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
      component: "assistants.psychologist-assistants.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-assistants_failed",
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
