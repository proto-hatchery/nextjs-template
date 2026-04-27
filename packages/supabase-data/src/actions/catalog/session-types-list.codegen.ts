/**
 * listSessionTypesAction
 *
 * @module @workspace/supabase-data/actions/catalog/session-types-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { SessionTypesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/session-types.dto.codegen"
import type { SessionTypesListParams } from "@workspace/supabase-data/modules/catalog/domain/ports/session-types-repository.port.codegen"
import { SessionTypesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/session-types-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const SessionTypesListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type SessionTypesListInput = z.infer<typeof SessionTypesListInputSchema>
export type SessionTypesListOutput = { rows: SessionTypesDTO[] }

export async function listSessionTypesAction(
  input: SessionTypesListInput
): Promise<SessionTypesListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_session-types" })
  const actorIdForLog = userId

  try {
    const validated = SessionTypesListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new SessionTypesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies SessionTypesListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as SessionTypesListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "catalog.session-types.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_session-types_success",
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
      component: "catalog.session-types.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_session-types_failed",
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
