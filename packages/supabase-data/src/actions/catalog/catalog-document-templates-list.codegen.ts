/**
 * listCatalogDocumentTemplatesAction
 *
 * @module @workspace/supabase-data/actions/catalog/catalog-document-templates-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { CatalogDocumentTemplatesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/catalog-document-templates.dto.codegen"
import type { CatalogDocumentTemplatesListParams } from "@workspace/supabase-data/modules/catalog/domain/ports/catalog-document-templates-repository.port.codegen"
import { CatalogDocumentTemplatesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/catalog-document-templates-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const CatalogDocumentTemplatesListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type CatalogDocumentTemplatesListInput = z.infer<
  typeof CatalogDocumentTemplatesListInputSchema
>
export type CatalogDocumentTemplatesListOutput = { rows: CatalogDocumentTemplatesDTO[] }

export async function listCatalogDocumentTemplatesAction(
  input: CatalogDocumentTemplatesListInput
): Promise<CatalogDocumentTemplatesListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_catalog-document-templates" })
  const actorIdForLog = userId

  try {
    const validated = CatalogDocumentTemplatesListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new CatalogDocumentTemplatesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies CatalogDocumentTemplatesListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as CatalogDocumentTemplatesListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "catalog.catalog-document-templates.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_catalog-document-templates_success",
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
      component: "catalog.catalog-document-templates.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_catalog-document-templates_failed",
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
