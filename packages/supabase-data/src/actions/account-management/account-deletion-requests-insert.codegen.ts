/**
 * insertAccountDeletionRequestsAction
 *
 * @module @workspace/supabase-data/actions/account-management/account-deletion-requests-insert.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { AccountDeletionRequestsDTO } from "@workspace/supabase-data/modules/account-management/domain/dto/account-deletion-requests.dto.codegen"
import { AccountDeletionRequestsSupabaseRepository } from "@workspace/supabase-data/modules/account-management/infrastructure/repositories/account-deletion-requests-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const AccountDeletionRequestsInsertInputSchema = z.object({
  approvedAt: z.string().nullable().optional(),
  cancelledAt: z.string().nullable().optional(),
  correlationId: z.uuid({ error: "Invalid UUID" }).optional(),
  failedAt: z.string().nullable().optional(),
  failureReason: z.string().nullable().optional(),
  metadata: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  processedAt: z.string().nullable().optional(),
  processingStartedAt: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  requestedAt: z.string().optional(),
  requestedBy: z.string(),
  retentionUntil: z.string().nullable().optional(),
  status: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  userId: z.uuid({ error: "Invalid UUID" }),
})

export type AccountDeletionRequestsInsertInput = z.infer<
  typeof AccountDeletionRequestsInsertInputSchema
>
export type AccountDeletionRequestsInsertOutput = AccountDeletionRequestsDTO

export async function insertAccountDeletionRequestsAction(
  input: AccountDeletionRequestsInsertInput
): Promise<AccountDeletionRequestsInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_account-deletion-requests" })
  const actorIdForLog = userId

  try {
    const validated = AccountDeletionRequestsInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new AccountDeletionRequestsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<AccountDeletionRequestsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<AccountDeletionRequestsDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "account-management.account-deletion-requests.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_account-deletion-requests_success",
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
      component: "account-management.account-deletion-requests.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_account-deletion-requests_failed",
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
