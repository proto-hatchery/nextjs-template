// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistQuickNotesDTOSchema,
  type PsychologistQuickNotesDTO,
} from "@workspace/supabase-data/modules/notes/domain/dto/psychologist-quick-notes.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistQuickNotesRow = Database["public"]["Tables"]["psychologist_quick_notes"]["Row"]
type PsychologistQuickNotesInsert =
  Database["public"]["Tables"]["psychologist_quick_notes"]["Insert"]
type PsychologistQuickNotesUpdate =
  Database["public"]["Tables"]["psychologist_quick_notes"]["Update"]

const PsychologistQuickNotesFieldMappings = {
  completedAt: "completed_at",
  createdAt: "created_at",
  dueDate: "due_date",
  id: "id",
  isCompleted: "is_completed",
  priority: "priority",
  psychologistId: "psychologist_id",
  title: "title",
  updatedAt: "updated_at",
} as const

type PsychologistQuickNotesField = keyof typeof PsychologistQuickNotesFieldMappings

function fromPsychologistQuickNotesRow(row: PsychologistQuickNotesRow): PsychologistQuickNotesDTO {
  const mapped = {
    completedAt: row.completed_at,
    createdAt: row.created_at,
    dueDate: row.due_date,
    id: row.id,
    isCompleted: row.is_completed,
    priority: row.priority,
    psychologistId: row.psychologist_id,
    title: row.title,
    updatedAt: row.updated_at,
  }
  return PsychologistQuickNotesDTOSchema.parse(mapped)
}

function toPsychologistQuickNotesInsert(
  dto: Partial<PsychologistQuickNotesDTO>
): PsychologistQuickNotesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(PsychologistQuickNotesFieldMappings) as Array<
    [
      PsychologistQuickNotesField,
      (typeof PsychologistQuickNotesFieldMappings)[PsychologistQuickNotesField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistQuickNotesInsert
}

function toPsychologistQuickNotesUpdate(
  dto: Partial<PsychologistQuickNotesDTO>
): PsychologistQuickNotesUpdate {
  return toPsychologistQuickNotesInsert(dto) as PsychologistQuickNotesUpdate
}

export {
  fromPsychologistQuickNotesRow,
  toPsychologistQuickNotesInsert,
  toPsychologistQuickNotesUpdate,
}
