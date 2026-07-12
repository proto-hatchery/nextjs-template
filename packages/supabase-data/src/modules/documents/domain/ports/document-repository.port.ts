import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type { PatientDocumentDTO, PatientDocumentsDTO } from "../dto/patient-document.dto";
import type {
  CreateGeneratedDocumentDTO,
  GeneratedDocumentDTO,
  GeneratedDocumentWithTemplateAndPatientDTO,
  GeneratedDocumentWithTemplateDTO,
} from "../dto/generated-document.dto";

/**
 * Repository port (interface) for document operations
 *
 * This defines the contract that infrastructure implementations must follow.
 * Business logic depends on this port, not on concrete implementations.
 */
export interface DocumentRepository {
  /**
   * Find all documents for a patient
   */
  findByPatientId(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientDocumentsDTO, AppError>>;

  /**
   * Find a specific document by ID
   */
  findById(
    documentId: string,
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientDocumentDTO | null, AppError>>;

  /**
   * Add a new document to a patient
   */
  addDocument(
    patientId: string,
    psychologistId: string,
    document: PatientDocumentDTO,
  ): Promise<Result<PatientDocumentDTO, AppError>>;

  /**
   * Remove a document from a patient
   */
  removeDocument(
    documentId: string,
    patientId: string,
    psychologistId: string,
  ): Promise<Result<void, AppError>>;

  /**
   * Update document metadata
   */
  updateDocument(
    documentId: string,
    patientId: string,
    psychologistId: string,
    updates: Partial<Pick<PatientDocumentDTO, "label" | "status">>,
  ): Promise<Result<PatientDocumentDTO, AppError>>;

  /**
   * Find generated documents by patient
   */
  findGeneratedDocumentsByPatient(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<readonly GeneratedDocumentWithTemplateDTO[], AppError>>;

  /**
   * Find a generated document by ID
   */
  findGeneratedDocumentById(
    documentId: string,
    psychologistId: string,
  ): Promise<Result<GeneratedDocumentWithTemplateAndPatientDTO | null, AppError>>;

  /**
   * Create a generated document
   */
  createGeneratedDocument(
    input: CreateGeneratedDocumentDTO,
  ): Promise<Result<GeneratedDocumentDTO, AppError>>;

  /**
   * Update a generated document
   */
  updateGeneratedDocument(
    documentId: string,
    psychologistId: string,
    updates: Partial<Pick<GeneratedDocumentDTO, "title" | "encodedContent">>,
  ): Promise<Result<GeneratedDocumentDTO, AppError>>;

  /**
   * Rename a generated document
   */
  renameGeneratedDocument(
    documentId: string,
    psychologistId: string,
    title: string,
  ): Promise<Result<GeneratedDocumentDTO, AppError>>;

  /**
   * Delete a generated document
   */
  deleteGeneratedDocument(
    documentId: string,
    psychologistId: string,
  ): Promise<Result<void, AppError>>;
}
