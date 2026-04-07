/**
 * ListAccountDeletionRequests Server Action
 * 
 * Handles list operation for account_deletion_requests.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { listAccountDeletionRequestsAction } from "@workspace/supabase-data/actions/account-management/account-deletion-requests-list.codegen"
 * 
 * const result = await listAccountDeletionRequestsAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/account-management/account-deletion-requests-list
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { AccountDeletionRequestsSupabaseRepository } from "@workspace/supabase-data/modules/account-management/infrastructure/repositories/account-deletion-requests-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for listAccountDeletionRequestsAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const AccountDeletionRequestsListInputSchema = z.object({
  // TODO: Define input fields based on account_deletion_requests.list requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for listAccountDeletionRequestsAction
 */
export type AccountDeletionRequestsListInput = z.infer<typeof AccountDeletionRequestsListInputSchema>

/**
 * Output type for listAccountDeletionRequestsAction — unknown until the action is wired to real DTOs / port types.
 */
export type AccountDeletionRequestsListOutput = unknown

/**
 * ListAccountDeletionRequests Server Action
 * 
 * @param input - Action input
 */
export async function listAccountDeletionRequestsAction(
  input: AccountDeletionRequestsListInput
): Promise<AccountDeletionRequestsListOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "list_account-deletion-requests",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = AccountDeletionRequestsListInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new AccountDeletionRequestsSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — list params unknown until semantic plan fills Zod input
    const result = await repository.list(validated as never)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "account-management.account-deletion-requests.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_account-deletion-requests_success",
      operation: "list",
      operationType: "action",
      outcome: "success",
      service: "supabase-data",
    })

    return result
  } catch (error) {
    // 6. Log error with sanitized metadata (HIPAA compliant)
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
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
