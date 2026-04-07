// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { CatalogClinicalActivitiesDTOSchema, type CatalogClinicalActivitiesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/catalog-clinical-activities.dto.codegen"

type CatalogClinicalActivitiesRow = Database["public"]["Tables"]["catalog_clinical_activities"]["Row"]
type CatalogClinicalActivitiesInsert = Database["public"]["Tables"]["catalog_clinical_activities"]["Insert"]
type CatalogClinicalActivitiesUpdate = Database["public"]["Tables"]["catalog_clinical_activities"]["Update"]

const CatalogClinicalActivitiesFieldMappings = {
  active: "active",
  activityKind: "activity_kind",
  clinicianNotesTemplate: "clinician_notes_template",
  code: "code",
  createdAt: "created_at",
  deliveryModes: "delivery_modes",
  description: "description",
  durationMin: "duration_min",
  goals: "goals",
  id: "id",
  imagePath: "image_path",
  materialsJson: "materials_json",
  mediaUrl: "media_url",
  name: "name",
  pdfPath: "pdf_path",
  populations: "populations",
  riskLevel: "risk_level",
  tags: "tags",
  title: "title",
  updatedAt: "updated_at",
} as const

type CatalogClinicalActivitiesField = keyof typeof CatalogClinicalActivitiesFieldMappings

function fromCatalogClinicalActivitiesRow(row: CatalogClinicalActivitiesRow): CatalogClinicalActivitiesDTO {
  const mapped = {
    active: row.active,
    activityKind: row.activity_kind,
    clinicianNotesTemplate: row.clinician_notes_template,
    code: row.code,
    createdAt: row.created_at,
    deliveryModes: row.delivery_modes,
    description: row.description,
    durationMin: row.duration_min,
    goals: row.goals,
    id: row.id,
    imagePath: row.image_path,
    materialsJson: row.materials_json,
    mediaUrl: row.media_url,
    name: row.name,
    pdfPath: row.pdf_path,
    populations: row.populations,
    riskLevel: row.risk_level,
    tags: row.tags,
    title: row.title,
    updatedAt: row.updated_at,
  }
  return CatalogClinicalActivitiesDTOSchema.parse(mapped)
}

function toCatalogClinicalActivitiesInsert(dto: Partial<CatalogClinicalActivitiesDTO>): CatalogClinicalActivitiesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(CatalogClinicalActivitiesFieldMappings) as Array<
    [CatalogClinicalActivitiesField, (typeof CatalogClinicalActivitiesFieldMappings)[CatalogClinicalActivitiesField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as CatalogClinicalActivitiesInsert
}

function toCatalogClinicalActivitiesUpdate(dto: Partial<CatalogClinicalActivitiesDTO>): CatalogClinicalActivitiesUpdate {
  return toCatalogClinicalActivitiesInsert(dto) as CatalogClinicalActivitiesUpdate
}

export { fromCatalogClinicalActivitiesRow, toCatalogClinicalActivitiesInsert, toCatalogClinicalActivitiesUpdate }
