/**
 * findByIdCatalogDocumentTemplatesAction
 *
 * @module @workspace/supabase-data/actions/catalog/catalog-document-templates-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { CatalogDocumentTemplatesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/catalog-document-templates.dto.codegen"
import { CatalogDocumentTemplatesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/catalog-document-templates-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const CatalogDocumentTemplatesFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type CatalogDocumentTemplatesFindByIdInput = z.infer<
  typeof CatalogDocumentTemplatesFindByIdInputSchema
>
export type CatalogDocumentTemplatesFindByIdOutput = CatalogDocumentTemplatesDTO | null

export async function findByIdCatalogDocumentTemplatesAction(
  input: CatalogDocumentTemplatesFindByIdInput
): Promise<CatalogDocumentTemplatesFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_catalog-document-templates" })
  const actorIdForLog = userId

  try {
    const validated = CatalogDocumentTemplatesFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new CatalogDocumentTemplatesSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "catalog.catalog-document-templates.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_catalog-document-templates_success",
      operation: "findById",
      operationType: "action",
      outcome: "success",
      metadata: {
        id: validated.id,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "catalog.catalog-document-templates.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_catalog-document-templates_failed",
      operation: "findById",
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
