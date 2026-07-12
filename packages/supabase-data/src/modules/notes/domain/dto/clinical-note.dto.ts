/**
 * Clinical Note Domain DTOs
 *
 * Pure domain models with no infrastructure dependencies.
 * These DTOs represent clinical notes in the business domain.
 */

/**
 * Clinical note type enumeration
 * Must match database enum: public.clinical_note_type
 */
export type ClinicalNoteType =
  | "clinical_note"
  | "progress_note"
  | "hypothesis"
  | "treatment_plan"
  | "risk_assessment"
  | "test_result";

/**
 * Clinical Note DTO
 *
 * Represents a clinical note in the domain.
 * Readonly and immutable by design.
 */
export interface ClinicalNoteDTO {
  readonly id: string;
  readonly patientId: string;
  readonly psychologistId: string;
  readonly noteType: ClinicalNoteType | null;
  readonly encodedContent: string;
  readonly title: string | null;
  readonly createdAt: string; // DB has default now()
  readonly updatedAt: string; // DB has default now()
  readonly createdBy: string;
  readonly isArchived: boolean; // DB has default false
  readonly sessionId: string | null;
  readonly parentNoteId: string | null;
  readonly tags: readonly string[] | null;
}

/**
 * Clinical Note Summary DTO
 *
 * Lightweight version for list views.
 */
export interface ClinicalNoteSummaryDTO {
  readonly id: string;
  readonly patientId: string;
  readonly noteType: ClinicalNoteType | null;
  readonly title: string | null;
  readonly createdAt: string;
  readonly isArchived: boolean;
}

/**
 * Enriched read model used by app-facing note queries.
 */
export interface ClinicalNoteWithDetailsDTO extends ClinicalNoteDTO {
  readonly patientName: string | null;
  readonly sessionDate: string | null;
}

/**
 * Clinical Notes Collection DTO
 *
 * Paginated collection of notes.
 */
export interface ClinicalNotesCollectionDTO {
  readonly notes: readonly ClinicalNoteSummaryDTO[];
  readonly totalCount: number;
  readonly hasMore: boolean;
}

/**
 * Type guard for ClinicalNoteDTO
 */
export function isClinicalNoteDTO(value: unknown): value is ClinicalNoteDTO {
  if (!value || typeof value !== "object") return false;
  const note = value as Record<string, unknown>;
  return (
    typeof note.id === "string" &&
    typeof note.patientId === "string" &&
    typeof note.psychologistId === "string" &&
    typeof note.encodedContent === "string" &&
    typeof note.createdBy === "string"
  );
}
