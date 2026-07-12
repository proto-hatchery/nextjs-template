import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  ClinicalNoteDTO,
  ClinicalNoteSummaryDTO,
  ClinicalNoteType,
  ClinicalNoteWithDetailsDTO,
} from "../../domain/dto/clinical-note.dto";

/**
 * Database row type for clinical notes
 */
type NoteRow = Database["public"]["Tables"]["psychologist_notes"]["Row"];

/**
 * Database insert type for clinical notes
 */
type NoteInsert = Database["public"]["Tables"]["psychologist_notes"]["Insert"];

type NoteWithDetailsRow = NoteRow & {
  patient:
    | {
        full_name: string | null;
        display_name: string | null;
        preferred_name: string | null;
        first_name: string | null;
        last_name: string | null;
      }
    | {
        full_name: string | null;
        display_name: string | null;
        preferred_name: string | null;
        first_name: string | null;
        last_name: string | null;
      }[]
    | null;
  session:
    | {
        start_time: string | null;
      }
    | {
        start_time: string | null;
      }[]
    | null;
};

/**
 * Note Mapper
 *
 * Converts between database rows and domain DTOs.
 * This is the only layer that knows about database schema details.
 */

/**
 * Convert database row to domain DTO
 *
 * Handles type narrowing from .select() queries.
 */
export function fromDatabaseRow(
  row:
    | NoteRow
    | Pick<
        NoteRow,
        | "id"
        | "patient_id"
        | "psychologist_id"
        | "note_type"
        | "encoded_content"
        | "title"
        | "created_at"
        | "updated_at"
        | "created_by"
        | "is_archived"
        | "session_id"
        | "parent_note_id"
        | "tags"
      >,
): ClinicalNoteDTO {
  return {
    id: row.id,
    patientId: row.patient_id ?? "",
    psychologistId: row.psychologist_id,
    noteType: (row.note_type as ClinicalNoteType) ?? null,
    encodedContent: row.encoded_content ?? "",
    title: row.title ?? null,
    createdAt: row.created_at ?? new Date().toISOString(), // Fallback (DB has default)
    updatedAt: row.updated_at ?? new Date().toISOString(), // Fallback (DB has default)
    createdBy: row.created_by ?? row.psychologist_id,
    isArchived: row.is_archived ?? false, // Fallback (DB has default false)
    sessionId: row.session_id ?? null,
    parentNoteId: row.parent_note_id ?? null,
    tags: row.tags ? (row.tags as readonly string[]) : null,
  };
}

/**
 * Convert database row to summary DTO (lightweight)
 */
export function fromDatabaseRowToSummary(
  row: Pick<NoteRow, "id" | "patient_id" | "note_type" | "title" | "created_at" | "is_archived">,
): ClinicalNoteSummaryDTO {
  return {
    id: row.id,
    patientId: row.patient_id ?? "",
    noteType: (row.note_type as ClinicalNoteType) ?? null,
    title: row.title ?? null,
    createdAt: row.created_at ?? new Date().toISOString(), // Fallback
    isArchived: row.is_archived ?? false, // Fallback
  };
}

export function fromDatabaseRowToDetailed(row: NoteWithDetailsRow): ClinicalNoteWithDetailsDTO {
  const base = fromDatabaseRow(row);
  const patient = Array.isArray(row.patient) ? row.patient[0] : row.patient;
  const session = Array.isArray(row.session) ? row.session[0] : row.session;
  const patientNameFromParts = [patient?.first_name, patient?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    ...base,
    patientName:
      patient?.display_name ??
      patient?.preferred_name ??
      patient?.full_name ??
      (patientNameFromParts || null),
    sessionDate: session?.start_time ?? null,
  };
}

/** DB enum allows only these values; domain DTO may include future types. */
type DbNoteType = NoteInsert["note_type"];
type DbWritableNoteType = Exclude<DbNoteType, undefined>;

/**
 * Convert domain DTO to database insert format.
 * Only DB-allowed note types are written; domain may have more types for future use.
 */
export function toDatabaseInsert(
  dto: Omit<ClinicalNoteDTO, "id" | "createdAt" | "updatedAt">,
): NoteInsert {
  const insert: NoteInsert = {
    patient_id: dto.patientId,
    psychologist_id: dto.psychologistId,
    encoded_content: dto.encodedContent,
    title: dto.title,
    created_by: dto.createdBy,
    is_archived: dto.isArchived,
  };

  if (dto.noteType !== null && dto.noteType !== undefined) {
    insert.note_type = dto.noteType as DbWritableNoteType;
  }
  if (dto.sessionId !== null) {
    insert.session_id = dto.sessionId;
  }
  if (dto.parentNoteId !== null) {
    insert.parent_note_id = dto.parentNoteId;
  }
  if (dto.tags !== null) {
    insert.tags = dto.tags as string[];
  }

  return insert;
}

/**
 * Convert partial domain DTO to database update format
 */
export function toDatabaseUpdate(
  updates: Partial<
    Omit<
      ClinicalNoteDTO,
      "id" | "patientId" | "psychologistId" | "createdAt" | "updatedAt" | "createdBy"
    >
  >,
): Partial<NoteInsert> {
  const dbUpdates: Partial<NoteInsert> = {};

  if (updates.noteType !== undefined) {
    if (updates.noteType === null) {
      dbUpdates.note_type = null;
    } else {
      dbUpdates.note_type = updates.noteType as DbWritableNoteType;
    }
  }
  if (updates.encodedContent !== undefined) {
    dbUpdates.encoded_content = updates.encodedContent;
  }
  if (updates.title !== undefined) {
    dbUpdates.title = updates.title;
  }
  if (updates.isArchived !== undefined) {
    dbUpdates.is_archived = updates.isArchived;
  }
  if (updates.sessionId !== undefined) {
    dbUpdates.session_id = updates.sessionId;
  }
  if (updates.parentNoteId !== undefined) {
    dbUpdates.parent_note_id = updates.parentNoteId;
  }
  if (updates.tags !== undefined) {
    dbUpdates.tags = updates.tags as string[] | null;
  }

  return dbUpdates;
}
