// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const CatalogDocumentTemplatesDTOSchema = z.object({
  createdAt: looseCell,
  createdBy: looseCell,
  description: looseCell,
  id: looseCell,
  templateCategory: looseCell,
  templateData: looseCell,
  title: looseCell,
  updatedAt: looseCell,
  updatedBy: looseCell,
  usageCount: looseCell,
})

type CatalogDocumentTemplatesDTO = z.infer<typeof CatalogDocumentTemplatesDTOSchema>

export { CatalogDocumentTemplatesDTOSchema, type CatalogDocumentTemplatesDTO }
