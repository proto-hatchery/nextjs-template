/**
 * Domain DTO for patient documents
 *
 * This represents the business-facing model for documents,
 * decoupled from database schema details.
 */

/**
 * Patient document summary (lightweight)
 */
export interface PatientDocumentDTO {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly status: "pending" | "complete" | "failed";
  readonly storagePath: string;
  readonly size: string;
  readonly uploadedAt: string;
}

/**
 * Patient document with detailed metadata
 */
export interface PatientDocumentDetailDTO extends PatientDocumentDTO {
  readonly uploadedBy: string;
  readonly downloadUrl?: string;
}

/**
 * Document collection for a patient
 */
export interface PatientDocumentsDTO {
  readonly patientId: string;
  readonly documents: readonly PatientDocumentDTO[];
  readonly totalCount: number;
}

/**
 * Type guard for PatientDocumentDTO
 */
export function isPatientDocumentDTO(value: unknown): value is PatientDocumentDTO {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "label" in value &&
    typeof value.label === "string" &&
    "storagePath" in value &&
    typeof value.storagePath === "string"
  );
}

/**
 * Type guard for array of PatientDocumentDTO
 */
export function isPatientDocumentDTOArray(value: unknown): value is readonly PatientDocumentDTO[] {
  return Array.isArray(value) && value.every(isPatientDocumentDTO);
}
