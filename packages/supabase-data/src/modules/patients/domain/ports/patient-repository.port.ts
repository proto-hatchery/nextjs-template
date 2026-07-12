import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type {
  PatientDTO,
  PatientWithContactsDTO,
  PatientsCollectionDTO,
  EmergencyContactDTO,
  PatientAssessment,
  PatientActivityWithDetails,
  PatientClinicalData,
  PatientFilters,
} from "../dto/patient.dto";

/**
 * Patient guardian information
 */
export interface PatientGuardian {
  id: string;
  name: string;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  cpf: string | null;
}

/**
 * Guardian document
 */
export interface GuardianDocument {
  id: string;
  name: string;
  type: string | null;
  fileUrl: string | null;
  createdAt: string | null;
}

/**
 * Repository port (interface) for patient operations
 *
 * This defines the contract that infrastructure implementations must follow.
 * Business logic depends on this port, not on concrete implementations.
 */
export interface PatientRepository {
  /**
   * Find a patient by ID
   */
  findById(patientId: string, psychologistId: string): Promise<Result<PatientDTO | null, AppError>>;

  /**
   * Find a patient with emergency contacts
   */
  findByIdWithContacts(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientWithContactsDTO | null, AppError>>;

  /**
   * List all patients for a psychologist
   */
  findAll(
    psychologistId: string,
    options?: PatientFilters,
  ): Promise<Result<PatientsCollectionDTO, AppError>>;

  /**
   * Create a new patient
   */
  create(
    psychologistId: string,
    patient: Omit<PatientDTO, "id" | "psychologistId" | "createdAt" | "updatedAt" | "archivedAt">,
    emergencyContacts?: readonly EmergencyContactDTO[],
  ): Promise<Result<PatientDTO, AppError>>;

  /**
   * Update an existing patient
   */
  update(
    patientId: string,
    psychologistId: string,
    updates: Partial<
      Omit<PatientDTO, "id" | "psychologistId" | "createdAt" | "updatedAt" | "archivedAt">
    >,
    emergencyContacts?: readonly EmergencyContactDTO[],
  ): Promise<Result<PatientDTO, AppError>>;

  /**
   * Archive a patient (soft delete)
   */
  archive(patientId: string, psychologistId: string): Promise<Result<void, AppError>>;

  /**
   * Unarchive a patient
   */
  unarchive(patientId: string, psychologistId: string): Promise<Result<void, AppError>>;

  /**
   * Change patient active status
   */
  changeStatus(
    patientId: string,
    psychologistId: string,
    isActive: boolean,
  ): Promise<Result<void, AppError>>;

  /**
   * Check if patient exists and belongs to psychologist
   */
  exists(patientId: string, psychologistId: string): Promise<Result<boolean, AppError>>;

  /**
   * Get patient count for a psychologist
   */
  count(
    psychologistId: string,
    options?: { status?: string | string[] },
  ): Promise<Result<number, AppError>>;

  /**
   * Get guardians and documents for a patient
   */
  getGuardiansData(
    patientId: string,
    psychologistId: string,
  ): Promise<
    Result<
      {
        primary: PatientGuardian | null;
        secondary: PatientGuardian | null;
        documents: GuardianDocument[];
      },
      AppError
    >
  >;

  /**
   * Get assessments for a patient
   */
  getAssessments(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientAssessment[], AppError>>;

  /**
   * Get activity assignments for a patient
   */
  getActivities(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientActivityWithDetails[], AppError>>;

  /**
   * Get clinical data for a patient
   */
  getClinicalData(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientClinicalData, AppError>>;
}
