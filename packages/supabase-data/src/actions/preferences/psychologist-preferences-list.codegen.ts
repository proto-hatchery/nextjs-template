/**
 * listPsychologistPreferencesAction
 *
 * @module @workspace/supabase-data/actions/preferences/psychologist-preferences-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPreferencesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-preferences.dto.codegen"
import type { PsychologistPreferencesListParams } from "@workspace/supabase-data/modules/preferences/domain/ports/psychologist-preferences-repository.port.codegen"
import { PsychologistPreferencesSupabaseRepository } from "@workspace/supabase-data/modules/preferences/infrastructure/repositories/psychologist-preferences-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPreferencesListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type PsychologistPreferencesListInput = z.infer<
  typeof PsychologistPreferencesListInputSchema
>
export type PsychologistPreferencesListOutput = { rows: PsychologistPreferencesDTO[] }

export async function listPsychologistPreferencesAction(
  input: PsychologistPreferencesListInput
): Promise<PsychologistPreferencesListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_psychologist-preferences" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPreferencesListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPreferencesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies PsychologistPreferencesListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as PsychologistPreferencesListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "preferences.psychologist-preferences.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-preferences_success",
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
      component: "preferences.psychologist-preferences.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_psychologist-preferences_failed",
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
