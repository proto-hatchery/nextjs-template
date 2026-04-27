// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { CatalogClinicalActivitiesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/catalog-clinical-activities.dto.codegen"
import type {
  CatalogClinicalActivitiesRepository,
  CatalogClinicalActivitiesListParams,
  CatalogClinicalActivitiesListResult,
} from "@workspace/supabase-data/modules/catalog/domain/ports/catalog-clinical-activities-repository.port.codegen"
import { fromCatalogClinicalActivitiesRow } from "@workspace/supabase-data/modules/catalog/infrastructure/mappers/catalog-clinical-activities.mapper.codegen"

class CatalogClinicalActivitiesSupabaseRepository implements CatalogClinicalActivitiesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<CatalogClinicalActivitiesDTO | null> {
    const { data, error } = await this.supabase
      .from("catalog_clinical_activities")
      .select(
        "active, activity_kind, clinician_notes_template, code, created_at, delivery_modes, description, duration_min, goals, id, image_path, materials_json, media_url, name, pdf_path, populations, risk_level, tags, title, updated_at"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load catalog_clinical_activities.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromCatalogClinicalActivitiesRow(data)
  }

  async list(
    params: CatalogClinicalActivitiesListParams
  ): Promise<CatalogClinicalActivitiesListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("catalog_clinical_activities")
      .select(
        "active, activity_kind, clinician_notes_template, code, created_at, delivery_modes, description, duration_min, goals, id, image_path, materials_json, media_url, name, pdf_path, populations, risk_level, tags, title, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list catalog_clinical_activities.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromCatalogClinicalActivitiesRow(row))
    return { rows }
  }
}

export { CatalogClinicalActivitiesSupabaseRepository }
