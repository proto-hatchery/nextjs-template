/**
 * Domain DTOs for patients module
 *
 * These represent the business-facing models for patients,
 * decoupled from database schema details.
 */

/**
 * Emergency contact for a patient
 */
export interface EmergencyContactDTO {
  readonly name: string;
  readonly phone: string;
  readonly relationship?: string;
}

/**
 * Patient address information
 */
export interface PatientAddressDTO {
  readonly street?: string;
  readonly number?: string;
  readonly complement?: string;
  readonly neighborhood?: string;
  readonly city?: string;
  readonly state?: string;
  readonly zipCode?: string;
  readonly country?: string;
}

/**
 * Compatibility-safe shape for patient document blobs stored in JSONB.
 */
export type PatientAttachedDocumentsDTO = Record<string, unknown> | unknown[] | null;

/**
 * Core patient information (read model)
 */
export interface PatientDTO {
  readonly id: string;
  readonly psychologistId: string;

  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly preferredName: string | null;
  readonly fullName: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly dateOfBirth: string | null; // YYYY-MM-DD
  readonly cpf: string | null;
  readonly gender: string | null;
  readonly address: PatientAddressDTO | null;
  readonly preferredContactMethod: string | null;
  readonly notificationsWhatsappSessionReminders: boolean;
  readonly patientOrigin: string | null;
  readonly attachedDocuments: PatientAttachedDocumentsDTO;
  readonly clinicalNotes: string | null;
  readonly isSynced: boolean;
  readonly lastSynced: string | null;

  // Computed/derived fields
  readonly displayName: string; // Built from available name fields
  readonly isMinor: boolean; // Calculated from date of birth
  readonly age: number | null; // Calculated from date of birth

  // Session defaults
  readonly defaultSessionPrice: number | null;

  // Metadata
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt: string | null;
}

/**
 * Patient assessment (test result)
 */
export interface PatientAssessment {
  readonly id: string;
  readonly patientId: string;
  readonly testName: string;
  readonly testType: string | null;
  readonly appliedAt: string | null;
  readonly notes: string | null;
  readonly fileUrl: string | null;
  readonly status: string | null;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}

/**
 * Patient activity assignment with catalog details
 */
export interface PatientActivityWithDetails {
  readonly id: string;
  readonly patientId: string;
  readonly psychologistId: string;
  readonly activityId: string;
  readonly status: string | null;
  readonly assignedAt: string | null;
  readonly dueDate: string | null;
  readonly completedAt: string | null;
  readonly isArchived: boolean;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
  readonly activity: {
    readonly name: string;
    readonly description: string | null;
    readonly activityKind: string | null;
    readonly durationMin: number | null;
  } | null;
}

/**
 * Patient clinical source of origin
 */
export type ClinicalDataSource = "client_portal" | "therapist";

/**
 * Clinical condition reported for a patient
 */
export interface PatientClinicalCondition {
  id: string;
  name: string;
  conditionType?: string | null;
  diagnosedDate?: string | null;
  icd10Code?: string | null;
  status?: string | null;
  notes?: string | null;
  source: ClinicalDataSource;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Clinical medication data for a patient
 */
export interface PatientClinicalMedication {
  id: string;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  route?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean | null;
  prescribedBy?: string | null;
  reason?: string | null;
  notes?: string | null;
  source: ClinicalDataSource;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Clinical data bundle for a patient
 */
export interface PatientClinicalData {
  patientId: string;
  psychologistId: string;
  hasLinkedClientAccount: boolean;
  initialComplaint: string | null;
  conditions: PatientClinicalCondition[];
  medications: PatientClinicalMedication[];
}

/**
 * Patient with emergency contacts (extended read model)
 */
export interface PatientWithContactsDTO extends PatientDTO {
  readonly emergencyContacts: readonly EmergencyContactDTO[];
}

/**
 * Lightweight patient summary (for lists)
 */
export interface PatientSummaryDTO {
  readonly id: string;
  readonly displayName: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly isMinor: boolean;
  readonly isActive: boolean;
  readonly defaultSessionPrice: number | null;
}

/**
 * Patient collection (paginated result)
 */
export interface PatientsCollectionDTO {
  readonly patients: readonly PatientSummaryDTO[];
  readonly totalCount: number;
  readonly hasMore: boolean;
}

/**
 * Filter options used when listing patients
 */
export interface PatientFilters {
  status?: "active" | "inactive" | "on_break" | "discharged" | "archived" | string[];
  search?: string;
  isMinor?: boolean;
  dateFrom?: string;
  dateTo?: string;
  patientIds?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Type guard for PatientDTO
 */
export function isPatientDTO(value: unknown): value is PatientDTO {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as PatientDTO).id === "string" &&
    "psychologistId" in value &&
    typeof (value as PatientDTO).psychologistId === "string" &&
    "displayName" in value &&
    typeof (value as PatientDTO).displayName === "string"
  );
}

/**
 * Type guard for PatientSummaryDTO
 */
export function isPatientSummaryDTO(value: unknown): value is PatientSummaryDTO {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as PatientSummaryDTO).id === "string" &&
    "displayName" in value &&
    typeof (value as PatientSummaryDTO).displayName === "string"
  );
}
