/**
 * listAccountDeletionRequestsAction
 *
 * @module @workspace/supabase-data/actions/account-management/account-deletion-requests-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { AccountDeletionRequestsDTO } from "@workspace/supabase-data/modules/account-management/domain/dto/account-deletion-requests.dto.codegen"
import type { AccountDeletionRequestsListParams } from "@workspace/supabase-data/modules/account-management/domain/ports/account-deletion-requests-repository.port.codegen"
import { AccountDeletionRequestsSupabaseRepository } from "@workspace/supabase-data/modules/account-management/infrastructure/repositories/account-deletion-requests-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const AccountDeletionRequestsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type AccountDeletionRequestsListInput = z.infer<
  typeof AccountDeletionRequestsListInputSchema
>
export type AccountDeletionRequestsListOutput = { rows: AccountDeletionRequestsDTO[] }

export async function listAccountDeletionRequestsAction(
  input: AccountDeletionRequestsListInput
): Promise<AccountDeletionRequestsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_account-deletion-requests" })
  const actorIdForLog = userId

  try {
    const validated = AccountDeletionRequestsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new AccountDeletionRequestsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies AccountDeletionRequestsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as AccountDeletionRequestsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "account-management.account-deletion-requests.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_account-deletion-requests_success",
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
      component: "account-management.account-deletion-requests.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_account-deletion-requests_failed",
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
