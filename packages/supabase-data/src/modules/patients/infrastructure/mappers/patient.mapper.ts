import type {
  PatientDTO,
  PatientWithContactsDTO,
  PatientSummaryDTO,
  PatientAssessment,
  PatientActivityWithDetails,
  PatientAddressDTO,
  EmergencyContactDTO,
  PatientAttachedDocumentsDTO,
} from "../../domain/dto/patient.dto";
import type { Database } from "@workspace/supabase-infra/types/database";

/**
 * Mapper for converting between database rows and domain DTOs
 *
 * This isolates database-specific types from domain logic.
 */

type PatientRow = Database["public"]["Tables"]["psychologist_patients"]["Row"];
type EmergencyContactRow =
  Database["public"]["Tables"]["psychologist_patient_emergency_contacts"]["Row"];
type AssessmentRow = Database["public"]["Tables"]["psychologist_patient_assessments"]["Row"];
type ActivityAssignmentRow = Database["public"]["Tables"]["psychologist_patient_activities"]["Row"];
type PatientRecord = PatientRow & Record<string, unknown>;

/**
 * Convert database row to PatientAssessment DTO
 */
export function fromAssessmentRow(row: AssessmentRow): PatientAssessment {
  return {
    id: row.id,
    patientId: row.patient_id ?? "",
    testName: row.test_name ?? "",
    testType: row.test_type,
    appliedAt: row.applied_at,
    notes: row.notes,
    fileUrl: row.file_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert database row to PatientActivityWithDetails DTO
 */
export function fromActivityAssignmentRow(
  row: ActivityAssignmentRow & {
    activity: {
      name: string;
      description: string | null;
      activity_kind: string | null;
      duration_min: number | null;
    } | null;
  },
): PatientActivityWithDetails {
  return {
    id: row.id,
    patientId: row.patient_id ?? "",
    psychologistId: row.psychologist_id,
    activityId: row.activity_id ?? "",
    status: row.status,
    assignedAt: row.assigned_at,
    dueDate: row.due_date,
    completedAt: row.submitted_at,
    isArchived: row.is_archived ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    activity: row.activity
      ? {
          name: row.activity.name,
          description: row.activity.description,
          activityKind: row.activity.activity_kind,
          durationMin: row.activity.duration_min,
        }
      : null,
  };
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;

  const parts = dateOfBirth.split("-").map(Number);
  if (parts.length !== 3) return null;

  const [year, month, day] = parts as [number, number, number];
  const birthDate = new Date(Date.UTC(year, month - 1, day));
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

/**
 * Calculate if patient is a minor
 */
function calculateIsMinor(dateOfBirth: string | null): boolean {
  const age = calculateAge(dateOfBirth);
  return age !== null && age < 18;
}

/**
 * Build display name from available name fields
 */
function pickString(row: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return null;
}

function pickBoolean(row: Record<string, unknown>, keys: readonly string[]): boolean | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "boolean") {
      return value;
    }
  }
  return null;
}

function pickJson(row: Record<string, unknown>, keys: readonly string[]): unknown {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined) {
      return value;
    }
  }
  return null;
}

function buildDisplayName(row: Record<string, unknown>): string {
  const displayName = pickString(row, ["display_name", "manual_display_name", "synced_display_name"]);
  if (displayName) return displayName;

  const preferredName = pickString(row, ["preferred_name", "manual_preferred_name"]);
  if (preferredName) return preferredName;

  const fullName = pickString(row, ["full_name", "manual_full_name", "synced_full_name"]);
  if (fullName) return fullName;

  const firstName = pickString(row, ["first_name", "manual_first_name"]);
  if (firstName) {
    const lastName = pickString(row, ["last_name", "manual_last_name"]);
    return lastName ? `${firstName} ${lastName}` : firstName;
  }

  return "Paciente Sem Nome";
}

/**
 * Parse address from JSONB
 */
function parseAddress(addressJson: unknown): PatientAddressDTO | null {
  if (!addressJson || typeof addressJson !== "object") {
    return null;
  }

  const addr = addressJson as Record<string, unknown>;
  return {
    ...(typeof addr.street === "string" ? { street: addr.street } : {}),
    ...(typeof addr.number === "string" ? { number: addr.number } : {}),
    ...(typeof addr.complement === "string" ? { complement: addr.complement } : {}),
    ...(typeof addr.neighborhood === "string" ? { neighborhood: addr.neighborhood } : {}),
    ...(typeof addr.city === "string" ? { city: addr.city } : {}),
    ...(typeof addr.state === "string" ? { state: addr.state } : {}),
    ...(typeof addr.zipCode === "string" ? { zipCode: addr.zipCode } : {}),
    ...(typeof addr.country === "string" ? { country: addr.country } : {}),
  };
}

function parseAttachedDocuments(documentsJson: unknown): PatientAttachedDocumentsDTO {
  if (Array.isArray(documentsJson)) {
    return documentsJson;
  }

  if (documentsJson && typeof documentsJson === "object") {
    return documentsJson as Record<string, unknown>;
  }

  return null;
}

/**
 * Convert database row to PatientDTO
 */
export function fromDatabaseRow(
  row: PatientRecord,
): PatientDTO {
  const firstName = pickString(row, ["first_name", "manual_first_name"]);
  const lastName = pickString(row, ["last_name", "manual_last_name"]);
  const preferredName = pickString(row, ["preferred_name", "manual_preferred_name"]);
  const fullName = pickString(row, ["full_name", "manual_full_name", "synced_full_name"]);
  const email = pickString(row, ["email", "manual_email", "synced_email"]);
  const phone = pickString(row, ["phone", "manual_phone", "synced_phone"]);
  const dateOfBirth = pickString(row, ["date_of_birth", "manual_date_of_birth", "synced_date_of_birth"]);
  const cpf = pickString(row, ["cpf", "manual_cpf", "synced_cpf"]);
  const gender = pickString(row, ["gender", "manual_gender", "synced_gender"]);
  const address = pickJson(row, ["address", "manual_address", "synced_address"]);
  const patientOrigin = pickString(row, ["patient_origin", "manual_patient_origin"]);

  return {
    id: row.id,
    psychologistId: row.psychologist_id,

    firstName,
    lastName,
    preferredName,
    fullName,
    email,
    phone,
    dateOfBirth,
    cpf,
    gender,
    address: parseAddress(address),
    preferredContactMethod: row.preferred_contact_method,
    notificationsWhatsappSessionReminders:
      pickBoolean(row, ["notifications_whatsapp_session_reminders"]) ?? true,
    patientOrigin,
    attachedDocuments: parseAttachedDocuments(row.attached_documents),
    clinicalNotes: row.clinical_notes,
    isSynced: pickBoolean(row, ["is_synced"]) ?? Boolean(row.patient_id),
    lastSynced: pickString(row, ["last_synced"]),

    // Computed fields
    displayName: buildDisplayName(row),
    isMinor: row.is_minor ?? calculateIsMinor(dateOfBirth),
    age: calculateAge(dateOfBirth),

    // Session defaults
    defaultSessionPrice: row.default_session_price,

    // Metadata
    isActive: row.status === "active",
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
    archivedAt: row.archived_at,
  };
}

/**
 * Convert database row to PatientSummaryDTO
 */
export function fromDatabaseRowToSummary(
  row: PatientRecord,
): PatientSummaryDTO {
  const displayName = buildDisplayName(row);
  const email = pickString(row, ["email", "manual_email", "synced_email"]);
  const phone = pickString(row, ["phone", "manual_phone", "synced_phone"]);
  const dateOfBirth = pickString(row, ["date_of_birth", "manual_date_of_birth", "synced_date_of_birth"]);

  return {
    id: row.id,
    displayName,
    email,
    phone,
    isMinor: row.is_minor ?? calculateIsMinor(dateOfBirth),
    isActive: row.status === "active",
    defaultSessionPrice: row.default_session_price,
  };
}

/**
 * Convert emergency contact row to DTO
 */
export function fromEmergencyContactRow(
  row:
    | EmergencyContactRow
    | Pick<
        EmergencyContactRow,
        "id" | "psychologist_patient_id" | "contact_name" | "phone" | "relationship" | "created_at"
      >,
): EmergencyContactDTO {
  return {
    name: row.contact_name,
    phone: row.phone ?? "",
    ...(row.relationship ? { relationship: row.relationship } : {}),
  };
}

/**
 * Convert PatientDTO with contacts to PatientWithContactsDTO
 */
export function withEmergencyContacts(
  patient: PatientDTO,
  contacts: readonly EmergencyContactDTO[],
): PatientWithContactsDTO {
  return {
    ...patient,
    emergencyContacts: contacts,
  };
}

/**
 * Convert domain DTO fields to database insert/update format
 */
export function toDatabaseInsert(patient: Partial<PatientDTO>): Partial<PatientRow> {
  const result: Partial<PatientRow> = {};

  if (patient.firstName !== undefined) result.manual_first_name = patient.firstName;
  if (patient.lastName !== undefined) result.manual_last_name = patient.lastName;
  if (patient.preferredName !== undefined) result.manual_preferred_name = patient.preferredName;
  if (patient.fullName !== undefined) result.manual_full_name = patient.fullName;
  if (patient.email !== undefined) result.manual_email = patient.email;
  if (patient.phone !== undefined) result.manual_phone = patient.phone;
  if (patient.dateOfBirth !== undefined) result.manual_date_of_birth = patient.dateOfBirth;
  if (patient.cpf !== undefined) result.manual_cpf = patient.cpf;
  if (patient.gender !== undefined) result.manual_gender = patient.gender;
  if (patient.address !== undefined)
    result.manual_address = patient.address as unknown as PatientRow["manual_address"];
  if (patient.attachedDocuments !== undefined)
    result.attached_documents = patient.attachedDocuments as PatientRow["attached_documents"];
  if (patient.clinicalNotes !== undefined) result.clinical_notes = patient.clinicalNotes;
  if (patient.preferredContactMethod !== undefined)
    result.preferred_contact_method =
      patient.preferredContactMethod as PatientRow["preferred_contact_method"];
  if (patient.patientOrigin !== undefined) result.manual_patient_origin = patient.patientOrigin;
  if (patient.defaultSessionPrice !== undefined)
    result.default_session_price = patient.defaultSessionPrice;
  if (patient.isActive !== undefined) result.status = patient.isActive ? "active" : "inactive";

  return result;
}
