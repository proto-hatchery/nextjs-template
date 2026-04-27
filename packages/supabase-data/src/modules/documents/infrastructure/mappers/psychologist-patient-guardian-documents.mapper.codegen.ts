// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistPatientGuardianDocumentsDTOSchema,
  type PsychologistPatientGuardianDocumentsDTO,
} from "@workspace/supabase-data/modules/documents/domain/dto/psychologist-patient-guardian-documents.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistPatientGuardianDocumentsRow =
  Database["public"]["Tables"]["psychologist_patient_guardian_documents"]["Row"]
type PsychologistPatientGuardianDocumentsInsert =
  Database["public"]["Tables"]["psychologist_patient_guardian_documents"]["Insert"]
type PsychologistPatientGuardianDocumentsUpdate =
  Database["public"]["Tables"]["psychologist_patient_guardian_documents"]["Update"]

const PsychologistPatientGuardianDocumentsFieldMappings = {
  createdAt: "created_at",
  description: "description",
  documentType: "document_type",
  expiresAt: "expires_at",
  fileName: "file_name",
  fileSize: "file_size",
  fileUrl: "file_url",
  guardianId: "guardian_id",
  id: "id",
  mimeType: "mime_type",
  patientId: "patient_id",
  psychologistId: "psychologist_id",
  status: "status",
  title: "title",
  updatedAt: "updated_at",
  uploadedAt: "uploaded_at",
} as const

type PsychologistPatientGuardianDocumentsField =
  keyof typeof PsychologistPatientGuardianDocumentsFieldMappings

function fromPsychologistPatientGuardianDocumentsRow(
  row: PsychologistPatientGuardianDocumentsRow
): PsychologistPatientGuardianDocumentsDTO {
  const mapped = {
    createdAt: row.created_at,
    description: row.description,
    documentType: row.document_type,
    expiresAt: row.expires_at,
    fileName: row.file_name,
    fileSize: row.file_size,
    fileUrl: row.file_url,
    guardianId: row.guardian_id,
    id: row.id,
    mimeType: row.mime_type,
    patientId: row.patient_id,
    psychologistId: row.psychologist_id,
    status: row.status,
    title: row.title,
    updatedAt: row.updated_at,
    uploadedAt: row.uploaded_at,
  }
  return PsychologistPatientGuardianDocumentsDTOSchema.parse(mapped)
}

function toPsychologistPatientGuardianDocumentsInsert(
  dto: Partial<PsychologistPatientGuardianDocumentsDTO>
): PsychologistPatientGuardianDocumentsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(
    PsychologistPatientGuardianDocumentsFieldMappings
  ) as Array<
    [
      PsychologistPatientGuardianDocumentsField,
      (typeof PsychologistPatientGuardianDocumentsFieldMappings)[PsychologistPatientGuardianDocumentsField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistPatientGuardianDocumentsInsert
}

function toPsychologistPatientGuardianDocumentsUpdate(
  dto: Partial<PsychologistPatientGuardianDocumentsDTO>
): PsychologistPatientGuardianDocumentsUpdate {
  return toPsychologistPatientGuardianDocumentsInsert(
    dto
  ) as PsychologistPatientGuardianDocumentsUpdate
}

export {
  fromPsychologistPatientGuardianDocumentsRow,
  toPsychologistPatientGuardianDocumentsInsert,
  toPsychologistPatientGuardianDocumentsUpdate,
}
