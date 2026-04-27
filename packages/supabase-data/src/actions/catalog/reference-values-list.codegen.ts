/**
 * listReferenceValuesAction
 *
 * @module @workspace/supabase-data/actions/catalog/reference-values-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { ReferenceValuesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/reference-values.dto.codegen"
import type { ReferenceValuesListParams } from "@workspace/supabase-data/modules/catalog/domain/ports/reference-values-repository.port.codegen"
import { ReferenceValuesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/reference-values-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const ReferenceValuesListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type ReferenceValuesListInput = z.infer<typeof ReferenceValuesListInputSchema>
export type ReferenceValuesListOutput = { rows: ReferenceValuesDTO[] }

export async function listReferenceValuesAction(
  input: ReferenceValuesListInput
): Promise<ReferenceValuesListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_reference-values" })
  const actorIdForLog = userId

  try {
    const validated = ReferenceValuesListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new ReferenceValuesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies ReferenceValuesListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as ReferenceValuesListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "catalog.reference-values.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_reference-values_success",
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
      component: "catalog.reference-values.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_reference-values_failed",
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
