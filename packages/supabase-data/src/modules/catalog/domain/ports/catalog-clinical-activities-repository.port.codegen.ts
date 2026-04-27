// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { CatalogClinicalActivitiesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/catalog-clinical-activities.dto.codegen"

export interface CatalogClinicalActivitiesListParams {
  limit?: number
  offset?: number
}

export interface CatalogClinicalActivitiesListResult {
  rows: CatalogClinicalActivitiesDTO[]
}

interface CatalogClinicalActivitiesRepository {
  findById(id: string): Promise<CatalogClinicalActivitiesDTO | null>
  list(params: CatalogClinicalActivitiesListParams): Promise<CatalogClinicalActivitiesListResult>
}

export { type CatalogClinicalActivitiesRepository }
