import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type {
  ClinicalNoteDTO,
  ClinicalNotesCollectionDTO,
  ClinicalNoteType,
  ClinicalNoteWithDetailsDTO,
} from "../dto/clinical-note.dto";

/**
 * Clinical Note Repository Port
 *
 * Domain interface for clinical note persistence.
 * Infrastructure implementations must conform to this contract.
 */
export interface ClinicalNoteRepository {
  /**
   * Find a note by ID
   */
  findById(
    noteId: string,
    psychologistId: string,
  ): Promise<Result<ClinicalNoteDTO | null, AppError>>;

  /**
   * Find an enriched note by ID for app-facing reads.
   */
  findDetailedById(
    noteId: string,
    psychologistId: string,
  ): Promise<Result<ClinicalNoteWithDetailsDTO | null, AppError>>;

  /**
   * Find the most recent note of a specific type for a patient
   */
  findByPatientAndType(
    patientId: string,
    psychologistId: string,
    noteType: ClinicalNoteType,
  ): Promise<Result<ClinicalNoteDTO | null, AppError>>;

  /**
   * Find all notes for a patient
   */
  findByPatient(
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
  ): Promise<Result<ClinicalNotesCollectionDTO, AppError>>;

  /**
   * Find enriched notes for app-facing reads.
   */
  findDetailedByPatient(
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
  ): Promise<Result<readonly ClinicalNoteWithDetailsDTO[], AppError>>;

  /**
   * Find enriched note by session.
   */
  findDetailedBySession(
    sessionId: string,
    psychologistId: string,
  ): Promise<Result<ClinicalNoteWithDetailsDTO | null, AppError>>;

  /**
   * Find recent enriched notes.
   */
  findRecentDetailed(
    psychologistId: string,
    limit: number,
  ): Promise<Result<readonly ClinicalNoteWithDetailsDTO[], AppError>>;

  /**
   * Find most recent enriched note of a type for a patient.
   */
  findDetailedByPatientAndType(
    patientId: string,
    psychologistId: string,
    noteType: ClinicalNoteType,
  ): Promise<Result<ClinicalNoteWithDetailsDTO | null, AppError>>;

  /**
   * Create a new clinical note
   */
  create(
    psychologistId: string,
    note: Omit<ClinicalNoteDTO, "id" | "createdAt" | "updatedAt">,
  ): Promise<Result<ClinicalNoteDTO, AppError>>;

  /**
   * Update an existing clinical note
   */
  update(
    noteId: string,
    psychologistId: string,
    updates: Partial<
      Omit<
        ClinicalNoteDTO,
        "id" | "patientId" | "psychologistId" | "createdAt" | "updatedAt" | "createdBy"
      >
    >,
  ): Promise<Result<ClinicalNoteDTO, AppError>>;

  /**
   * Archive a clinical note (soft delete)
   */
  archive(noteId: string, psychologistId: string): Promise<Result<void, AppError>>;

  /**
   * Unarchive a clinical note
   */
  unarchive(noteId: string, psychologistId: string): Promise<Result<void, AppError>>;

  /**
   * Delete a clinical note (hard delete)
   */
  delete(noteId: string, psychologistId: string): Promise<Result<void, AppError>>;

  /**
   * Link an evolution note to its source note
   */
  linkEvolutionNote(sourceNoteId: string, evolutionNoteId: string): Promise<Result<void, AppError>>;

  /**
   * Check if a note exists
   */
  exists(noteId: string, psychologistId: string): Promise<Result<boolean, AppError>>;
}
