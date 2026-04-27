// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistPatientGuardianDocumentsDTOSchema = z.object({
  createdAt: looseCell,
  description: looseCell,
  documentType: looseCell,
  expiresAt: looseCell,
  fileName: looseCell,
  fileSize: looseCell,
  fileUrl: looseCell,
  guardianId: looseCell,
  id: looseCell,
  mimeType: looseCell,
  patientId: looseCell,
  psychologistId: looseCell,
  status: looseCell,
  title: looseCell,
  updatedAt: looseCell,
  uploadedAt: looseCell,
})

type PsychologistPatientGuardianDocumentsDTO = z.infer<
  typeof PsychologistPatientGuardianDocumentsDTOSchema
>

export {
  PsychologistPatientGuardianDocumentsDTOSchema,
  type PsychologistPatientGuardianDocumentsDTO,
}
