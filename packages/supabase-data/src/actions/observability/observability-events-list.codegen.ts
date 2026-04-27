/**
 * listObservabilityEventsAction
 *
 * @module @workspace/supabase-data/actions/observability/observability-events-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { ObservabilityEventsDTO } from "@workspace/supabase-data/modules/observability/domain/dto/observability-events.dto.codegen"
import type { ObservabilityEventsListParams } from "@workspace/supabase-data/modules/observability/domain/ports/observability-events-repository.port.codegen"
import { ObservabilityEventsSupabaseRepository } from "@workspace/supabase-data/modules/observability/infrastructure/repositories/observability-events-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const ObservabilityEventsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type ObservabilityEventsListInput = z.infer<typeof ObservabilityEventsListInputSchema>
export type ObservabilityEventsListOutput = { rows: ObservabilityEventsDTO[] }

export async function listObservabilityEventsAction(
  input: ObservabilityEventsListInput
): Promise<ObservabilityEventsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({
    action: "list_observability-events",
    requiredRole: "admin",
  })
  const actorIdForLog = userId

  try {
    const validated = ObservabilityEventsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new ObservabilityEventsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies ObservabilityEventsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as ObservabilityEventsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "observability.observability-events.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_observability-events_success",
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
      component: "observability.observability-events.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_observability-events_failed",
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
