/**
 * listGeneratedDocumentsAction
 *
 * @module @workspace/supabase-data/actions/documents/generated-documents-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { GeneratedDocumentsDTO } from "@workspace/supabase-data/modules/documents/domain/dto/generated-documents.dto.codegen"
import type { GeneratedDocumentsListParams } from "@workspace/supabase-data/modules/documents/domain/ports/generated-documents-repository.port.codegen"
import { GeneratedDocumentsSupabaseRepository } from "@workspace/supabase-data/modules/documents/infrastructure/repositories/generated-documents-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const GeneratedDocumentsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type GeneratedDocumentsListInput = z.infer<typeof GeneratedDocumentsListInputSchema>
export type GeneratedDocumentsListOutput = { rows: GeneratedDocumentsDTO[] }

export async function listGeneratedDocumentsAction(
  input: GeneratedDocumentsListInput
): Promise<GeneratedDocumentsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_generated-documents" })
  const actorIdForLog = userId

  try {
    const validated = GeneratedDocumentsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new GeneratedDocumentsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies GeneratedDocumentsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as GeneratedDocumentsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "documents.generated-documents.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_generated-documents_success",
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
      component: "documents.generated-documents.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_generated-documents_failed",
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
