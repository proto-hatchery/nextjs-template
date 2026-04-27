// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const GeneratedDocumentsDTOSchema = z.object({
  content: looseCell,
  createdAt: looseCell,
  createdBy: looseCell,
  documentType: looseCell,
  encodedContent: looseCell,
  id: looseCell,
  isArchived: looseCell,
  patientId: looseCell,
  psychologistClientId: looseCell,
  psychologistId: looseCell,
  tags: looseCell,
  templateId: looseCell,
  title: looseCell,
  updatedAt: looseCell,
  updatedBy: looseCell,
})

type GeneratedDocumentsDTO = z.infer<typeof GeneratedDocumentsDTOSchema>

export { GeneratedDocumentsDTOSchema, type GeneratedDocumentsDTO }
