import { err, ok, type Result } from "neverthrow";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { AppError } from "../../../../lib/errors/app-error";
import { AppErrorCode } from "../../../../lib/errors/app-error";
import type { ClinicalNoteRepository } from "../../domain/ports/note-repository.port";
import type {
  ClinicalNoteDTO,
  ClinicalNotesCollectionDTO,
  ClinicalNoteType,
  ClinicalNoteWithDetailsDTO,
} from "../../domain/dto/clinical-note.dto";
import {
  fromDatabaseRow,
  fromDatabaseRowToDetailed,
  fromDatabaseRowToSummary,
  toDatabaseInsert,
  toDatabaseUpdate,
} from "../mappers/note.mapper";

/** DB enum for note_type column; domain ClinicalNoteType may include future values. */
type DbNoteType = Database["public"]["Enums"]["clinical_note_type"];
const SELECT_NOTE_FIELDS =
  "id,patient_id,psychologist_id,note_type,encoded_content,title,created_at,updated_at,created_by,is_archived,session_id,parent_note_id,tags" as const;
const SELECT_NOTE_WITH_RELATIONS = `
  id,
  patient_id,
  psychologist_id,
  note_type,
  encoded_content,
  title,
  created_at,
  updated_at,
  created_by,
  is_archived,
  session_id,
  parent_note_id,
  tags,
  patient:psychologist_patients!psychologist_notes_patient_id_fkey (
    display_name,
    preferred_name,
    full_name,
    first_name,
    last_name
  )
` as const;

/**
 * Supabase implementation of Clinical Note Repository
 *
 * This is the ONLY file in the notes module that imports Database types.
 */
export class NoteSupabaseRepository implements ClinicalNoteRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Find a note by ID
   */
  async findById(
    noteId: string,
    psychologistId: string,
  ): Promise<Result<ClinicalNoteDTO | null, AppError>> {
    const { data, error } = await this.supabase
      .from("psychologist_notes")
      .select(SELECT_NOTE_FIELDS)
      .eq("id", noteId)
      .eq("psychologist_id", psychologistId)
      .maybeSingle();

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to fetch clinical note",
        context: { originalError: error.message },
      });
    }

    if (!data) {
      return ok(null);
    }

    return ok(fromDatabaseRow(data));
  }

  async findDetailedById(
    noteId: string,
    psychologistId: string,
  ): Promise<Result<ClinicalNoteWithDetailsDTO | null, AppError>> {
    const { data, error } = await this.supabase
      .from("psychologist_notes")
      .select(SELECT_NOTE_WITH_RELATIONS)
      .eq("id", noteId)
      .eq("psychologist_id", psychologistId)
      .maybeSingle();

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to fetch clinical note",
        context: { originalError: error.message },
      });
    }

    if (!data) {
      return ok(null);
    }

    return ok(
      fromDatabaseRowToDetailed(data as unknown as Parameters<typeof fromDatabaseRowToDetailed>[0]),
    );
  }

  /**
   * Find the most recent note of a specific type for a patient
   */
  async findByPatientAndType(
    patientId: string,
    psychologistId: string,
    noteType: ClinicalNoteType,
  ): Promise<Result<ClinicalNoteDTO | null, AppError>> {
    const { data, error } = await this.supabase
      .from("psychologist_notes")
      .select(SELECT_NOTE_FIELDS)
      .eq("patient_id", patientId)
      .eq("psychologist_id", psychologistId)
      .eq("note_type", noteType as DbNoteType)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to fetch clinical note by type",
        context: { originalError: error.message },
      });
    }

    if (!data) {
      return ok(null);
    }

    return ok(fromDatabaseRow(data));
  }

  /**
   * Find all notes for a patient
   */
  async findByPatient(
    patientId: string | null,
    psychologistId: string,
    options?: {
      includeArchived?: boolean;
      isArchived?: boolean;
      noteType?: ClinicalNoteType;
      sessionId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<Result<ClinicalNotesCollectionDTO, AppError>> {
    const SELECT_SUMMARY_FIELDS = "id,patient_id,note_type,title,created_at,is_archived" as const;

    let query = this.supabase
      .from("psychologist_notes")
      .select(SELECT_SUMMARY_FIELDS, { count: "exact" })
      .eq("psychologist_id", psychologistId);

    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    if (options?.sessionId) {
      query = query.eq("session_id", options.sessionId);
    }

    if (options?.isArchived !== undefined) {
      query = query.eq("is_archived", options.isArchived);
    } else if (!options?.includeArchived) {
      query = query.eq("is_archived", false);
    }

    if (options?.noteType) {
      query = query.eq("note_type", options.noteType as DbNoteType);
    }

    query = query.order("created_at", { ascending: false });

    if (options?.offset !== undefined) {
      query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
    } else if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }

    const { data, error, count } = await query;

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to fetch clinical notes",
        context: { originalError: error.message },
      });
    }

    const notes = (data ?? []).map(fromDatabaseRowToSummary);
    const totalCount = count ?? 0;
    const hasMore =
      options?.limit !== undefined && totalCount > (options.offset ?? 0) + options.limit;

    return ok({
      notes,
      totalCount,
      hasMore,
    });
  }

  async findDetailedByPatient(
    patientId: string | null,
    psychologistId: string,
    options?: {
      includeArchived?: boolean;
      isArchived?: boolean;
      noteType?: ClinicalNoteType;
      sessionId?: string;
      search?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<Result<readonly ClinicalNoteWithDetailsDTO[], AppError>> {
    let query = this.supabase
      .from("psychologist_notes")
      .select(SELECT_NOTE_WITH_RELATIONS)
      .eq("psychologist_id", psychologistId)
      .order("created_at", { ascending: false });

    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    if (options?.sessionId) {
      query = query.eq("session_id", options.sessionId);
    }

    if (options?.isArchived !== undefined) {
      query = query.eq("is_archived", options.isArchived);
    } else if (!options?.includeArchived) {
      query = query.eq("is_archived", false);
    }

    if (options?.noteType) {
      query = query.eq("note_type", options.noteType as DbNoteType);
    }

    if (options?.search) {
      query = query.ilike("title", `%${options.search}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset !== undefined) {
      query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to fetch clinical notes",
        context: { originalError: error.message },
      });
    }

    return ok(
      (data ?? []).map((row) =>
        fromDatabaseRowToDetailed(
          row as unknown as Parameters<typeof fromDatabaseRowToDetailed>[0],
        ),
      ),
    );
  }

  async findDetailedBySession(
    sessionId: string,
    psychologistId: string,
  ): Promise<Result<ClinicalNoteWithDetailsDTO | null, AppError>> {
    const result = await this.findDetailedByPatient(null, psychologistId, {
      sessionId,
      noteType: "clinical_note",
      limit: 1,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value[0] ?? null);
  }

  async findRecentDetailed(
    psychologistId: string,
    limit: number,
  ): Promise<Result<readonly ClinicalNoteWithDetailsDTO[], AppError>> {
    return this.findDetailedByPatient(null, psychologistId, { limit });
  }

  async findDetailedByPatientAndType(
    patientId: string,
    psychologistId: string,
    noteType: ClinicalNoteType,
  ): Promise<Result<ClinicalNoteWithDetailsDTO | null, AppError>> {
    const result = await this.findDetailedByPatient(patientId, psychologistId, {
      noteType,
      limit: 1,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value[0] ?? null);
  }

  /**
   * Create a new clinical note
   */
  async create(
    psychologistId: string,
    note: Omit<ClinicalNoteDTO, "id" | "createdAt" | "updatedAt">,
  ): Promise<Result<ClinicalNoteDTO, AppError>> {
    const insert = toDatabaseInsert(note);

    const { data, error } = await this.supabase
      .from("psychologist_notes")
      .insert(insert)
      .select(
        "id,patient_id,psychologist_id,note_type,encoded_content,title,created_at,updated_at,created_by,is_archived,session_id,parent_note_id,tags",
      )
      .single();

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to create clinical note",
        context: { originalError: error.message },
      });
    }

    return ok(fromDatabaseRow(data));
  }

  /**
   * Update an existing clinical note
   */
  async update(
    noteId: string,
    psychologistId: string,
    updates: Partial<
      Omit<
        ClinicalNoteDTO,
        "id" | "patientId" | "psychologistId" | "createdAt" | "updatedAt" | "createdBy"
      >
    >,
  ): Promise<Result<ClinicalNoteDTO, AppError>> {
    const dbUpdates = toDatabaseUpdate(updates);

    const { data, error } = await this.supabase
      .from("psychologist_notes")
      .update(dbUpdates)
      .eq("id", noteId)
      .eq("psychologist_id", psychologistId)
      .select(
        "id,patient_id,psychologist_id,note_type,encoded_content,title,created_at,updated_at,created_by,is_archived,session_id,parent_note_id,tags",
      )
      .single();

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to update clinical note",
        context: { originalError: error.message },
      });
    }

    return ok(fromDatabaseRow(data));
  }

  /**
   * Archive a clinical note (soft delete)
   */
  async archive(noteId: string, psychologistId: string): Promise<Result<void, AppError>> {
    const { error } = await this.supabase
      .from("psychologist_notes")
      .update({ is_archived: true })
      .eq("id", noteId)
      .eq("psychologist_id", psychologistId);

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to archive clinical note",
        context: { originalError: error.message },
      });
    }

    return ok(undefined);
  }

  /**
   * Unarchive a clinical note
   */
  async unarchive(noteId: string, psychologistId: string): Promise<Result<void, AppError>> {
    const { error } = await this.supabase
      .from("psychologist_notes")
      .update({ is_archived: false })
      .eq("id", noteId)
      .eq("psychologist_id", psychologistId);

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to unarchive clinical note",
        context: { originalError: error.message },
      });
    }

    return ok(undefined);
  }

  /**
   * Delete a clinical note (hard delete)
   */
  async delete(noteId: string, psychologistId: string): Promise<Result<void, AppError>> {
    const { error } = await this.supabase
      .from("psychologist_notes")
      .delete()
      .eq("id", noteId)
      .eq("psychologist_id", psychologistId);

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to delete clinical note",
        context: { originalError: error.message },
      });
    }

    return ok(undefined);
  }

  /**
   * Link an evolution note to its source note
   */
  async linkEvolutionNote(
    sourceNoteId: string,
    evolutionNoteId: string,
  ): Promise<Result<void, AppError>> {
    const { error } = await this.supabase
      .from("psychologist_notes")
      .update({ parent_note_id: sourceNoteId })
      .eq("id", evolutionNoteId);

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to link evolution note",
        context: { originalError: error.message },
      });
    }

    return ok(undefined);
  }

  /**
   * Check if a note exists
   */
  async exists(noteId: string, psychologistId: string): Promise<Result<boolean, AppError>> {
    const { data, error } = await this.supabase
      .from("psychologist_notes")
      .select("id")
      .eq("id", noteId)
      .eq("psychologist_id", psychologistId)
      .maybeSingle();

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to check note existence",
        context: { originalError: error.message },
      });
    }

    return ok(data !== null);
  }
}
