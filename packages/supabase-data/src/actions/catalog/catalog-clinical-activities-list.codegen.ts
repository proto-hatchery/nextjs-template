/**
 * listCatalogClinicalActivitiesAction
 *
 * @module @workspace/supabase-data/actions/catalog/catalog-clinical-activities-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { CatalogClinicalActivitiesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/catalog-clinical-activities.dto.codegen"
import type { CatalogClinicalActivitiesListParams } from "@workspace/supabase-data/modules/catalog/domain/ports/catalog-clinical-activities-repository.port.codegen"
import { CatalogClinicalActivitiesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/catalog-clinical-activities-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const CatalogClinicalActivitiesListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type CatalogClinicalActivitiesListInput = z.infer<
  typeof CatalogClinicalActivitiesListInputSchema
>
export type CatalogClinicalActivitiesListOutput = { rows: CatalogClinicalActivitiesDTO[] }

export async function listCatalogClinicalActivitiesAction(
  input: CatalogClinicalActivitiesListInput
): Promise<CatalogClinicalActivitiesListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_catalog-clinical-activities" })
  const actorIdForLog = userId

  try {
    const validated = CatalogClinicalActivitiesListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new CatalogClinicalActivitiesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies CatalogClinicalActivitiesListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as CatalogClinicalActivitiesListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "catalog.catalog-clinical-activities.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_catalog-clinical-activities_success",
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
      component: "catalog.catalog-clinical-activities.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_catalog-clinical-activities_failed",
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
