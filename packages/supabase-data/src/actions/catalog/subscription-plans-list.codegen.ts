/**
 * listSubscriptionPlansAction
 *
 * @module @workspace/supabase-data/actions/catalog/subscription-plans-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { SubscriptionPlansDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/subscription-plans.dto.codegen"
import type { SubscriptionPlansListParams } from "@workspace/supabase-data/modules/catalog/domain/ports/subscription-plans-repository.port.codegen"
import { SubscriptionPlansSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/subscription-plans-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const SubscriptionPlansListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type SubscriptionPlansListInput = z.infer<typeof SubscriptionPlansListInputSchema>
export type SubscriptionPlansListOutput = { rows: SubscriptionPlansDTO[] }

export async function listSubscriptionPlansAction(
  input: SubscriptionPlansListInput
): Promise<SubscriptionPlansListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_subscription-plans" })
  const actorIdForLog = userId

  try {
    const validated = SubscriptionPlansListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new SubscriptionPlansSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies SubscriptionPlansListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as SubscriptionPlansListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "catalog.subscription-plans.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_subscription-plans_success",
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
      component: "catalog.subscription-plans.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_subscription-plans_failed",
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
