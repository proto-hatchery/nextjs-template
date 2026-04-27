// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const CatalogClinicalActivitiesDTOSchema = z.object({
  active: looseCell,
  activityKind: looseCell,
  clinicianNotesTemplate: looseCell,
  code: looseCell,
  createdAt: looseCell,
  deliveryModes: looseCell,
  description: looseCell,
  durationMin: looseCell,
  goals: looseCell,
  id: looseCell,
  imagePath: looseCell,
  materialsJson: looseCell,
  mediaUrl: looseCell,
  name: looseCell,
  pdfPath: looseCell,
  populations: looseCell,
  riskLevel: looseCell,
  tags: looseCell,
  title: looseCell,
  updatedAt: looseCell,
})

type CatalogClinicalActivitiesDTO = z.infer<typeof CatalogClinicalActivitiesDTOSchema>

export { CatalogClinicalActivitiesDTOSchema, type CatalogClinicalActivitiesDTO }
