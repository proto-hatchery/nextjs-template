// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistNotesDTOSchema,
  type PsychologistNotesDTO,
} from "@workspace/supabase-data/modules/notes/domain/dto/psychologist-notes.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistNotesRow = Database["public"]["Tables"]["psychologist_notes"]["Row"]
type PsychologistNotesInsert = Database["public"]["Tables"]["psychologist_notes"]["Insert"]
type PsychologistNotesUpdate = Database["public"]["Tables"]["psychologist_notes"]["Update"]

const PsychologistNotesFieldMappings = {
  content: "content",
  createdAt: "created_at",
  createdBy: "created_by",
  encodedContent: "encoded_content",
  id: "id",
  isArchived: "is_archived",
  noteType: "note_type",
  parentNoteId: "parent_note_id",
  patientId: "patient_id",
  psychologistClientId: "psychologist_client_id",
  psychologistId: "psychologist_id",
  sessionId: "session_id",
  tags: "tags",
  title: "title",
  updatedAt: "updated_at",
} as const

type PsychologistNotesField = keyof typeof PsychologistNotesFieldMappings

function fromPsychologistNotesRow(row: PsychologistNotesRow): PsychologistNotesDTO {
  const mapped = {
    content: row.content,
    createdAt: row.created_at,
    createdBy: row.created_by,
    encodedContent: row.encoded_content,
    id: row.id,
    isArchived: row.is_archived,
    noteType: row.note_type,
    parentNoteId: row.parent_note_id,
    patientId: row.patient_id,
    psychologistClientId: row.psychologist_client_id,
    psychologistId: row.psychologist_id,
    sessionId: row.session_id,
    tags: row.tags,
    title: row.title,
    updatedAt: row.updated_at,
  }
  return PsychologistNotesDTOSchema.parse(mapped)
}

function toPsychologistNotesInsert(dto: Partial<PsychologistNotesDTO>): PsychologistNotesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(PsychologistNotesFieldMappings) as Array<
    [PsychologistNotesField, (typeof PsychologistNotesFieldMappings)[PsychologistNotesField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistNotesInsert
}

function toPsychologistNotesUpdate(dto: Partial<PsychologistNotesDTO>): PsychologistNotesUpdate {
  return toPsychologistNotesInsert(dto) as PsychologistNotesUpdate
}

export { fromPsychologistNotesRow, toPsychologistNotesInsert, toPsychologistNotesUpdate }
