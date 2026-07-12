import type { Database, Json } from "@workspace/supabase-infra/types/database";
import type { PatientWithDetails } from "../types/entities";
import type {
  EmergencyContactDTO,
  PatientDTO,
  PatientSummaryDTO,
  PatientWithContactsDTO,
} from "../modules/patients/domain/dto/patient.dto";

type ContactMethodType = Database["public"]["Enums"]["contact_method_type"];
type PatientRow = Database["public"]["Tables"]["psychologist_patients"]["Row"];

const CONTACT_METHODS = new Set<ContactMethodType>(["whatsapp", "sms", "email", "phone"]);

function toContactMethod(value: string | null | undefined): ContactMethodType | null {
  if (!value) return null;
  return CONTACT_METHODS.has(value as ContactMethodType) ? (value as ContactMethodType) : null;
}

function toAddressJson(address: PatientDTO["address"]): Json | null {
  if (!address) return null;

  const normalized: Record<string, string> = {};

  if (address.street) normalized.street = address.street;
  if (address.number) normalized.number = address.number;
  if (address.complement) normalized.complement = address.complement;
  if (address.neighborhood) normalized.neighborhood = address.neighborhood;
  if (address.city) normalized.city = address.city;
  if (address.state) normalized.state = address.state;
  if (address.zipCode) {
    normalized.zipCode = address.zipCode;
    normalized.postalCode = address.zipCode;
  }
  if (address.country) normalized.country = address.country;

  return Object.keys(normalized).length > 0 ? (normalized as Json) : null;
}

function toEmergencyContactsJson(
  contacts: readonly EmergencyContactDTO[] | undefined,
): Json | null {
  if (!contacts || contacts.length === 0) return null;

  return contacts.map((contact) => ({
    name: contact.name,
    phone: contact.phone,
    relationship: contact.relationship ?? "",
  })) as Json;
}

function createPatientBase(params: {
  id: string;
  psychologistId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  age: number | null;
  gender: string | null;
  isMinor: boolean;
  status: string;
  defaultSessionPrice: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  archivedAt?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  preferredName?: string | null;
  fullName?: string | null;
  cpf?: string | null;
  address?: Json | null;
  patientOrigin?: string | null;
  emergencyContacts?: Json | null;
  preferredContactMethod?: string | null;
  notificationsWhatsappSessionReminders?: boolean;
  isSynced?: boolean;
  lastSynced?: string | null;
  attachedDocuments?: Json | null;
  clinicalNotes?: string | null;
}): PatientWithDetails {
  const row = {
    address: params.address ?? null,
    archived_at: params.archivedAt ?? null,
    archived_by: null,
    attached_documents: params.attachedDocuments ?? null,
    clinical_hypothesis: null,
    clinical_notes: params.clinicalNotes ?? null,
    cpf: params.cpf ?? null,
    created_at: params.createdAt ?? null,
    created_by: null,
    current_medications: null,
    data_sharing_consent: null,
    data_sharing_consent_date: null,
    date_of_birth: params.dateOfBirth,
    default_session_price: params.defaultSessionPrice,
    deleted_at: null,
    deleted_by: null,
    display_name: params.displayName,
    discharge_reason: null,
    disorders: null,
    email: params.email,
    emergency_contacts: params.emergencyContacts ?? null,
    first_name: params.firstName ?? null,
    first_session_date: null,
    full_name: params.fullName ?? null,
    gender: params.gender ?? null,
    id: params.id,
    informed_consent_date: null,
    informed_consent_document_url: null,
    informed_consent_signed: null,
    initial_complaint: null,
    invite_expires_at: null,
    invite_reminder_count: null,
    invite_reminder_sent_at: null,
    invite_sent_via: null,
    invite_status: null,
    invite_token: null,
    invited_at: null,
    is_minor: params.isMinor,
    is_synced: params.isSynced ?? false,
    known_allergies: null,
    last_name: params.lastName ?? null,
    last_session_date: null,
    last_synced: params.lastSynced ?? null,
    notifications_whatsapp_session_reminders: params.notificationsWhatsappSessionReminders ?? true,
    patient_id: null,
    patient_origin: params.patientOrigin ?? null,
    phone: params.phone,
    place_of_birth: null,
    preferred_contact_method: toContactMethod(params.preferredContactMethod),
    preferred_name: params.preferredName ?? null,
    price_set_at: null,
    price_set_by: null,
    profession: null,
    pronouns: null,
    psychologist_id: params.psychologistId,
    recovery_deadline: null,
    relationship_end_date: null,
    relationship_start_date: params.createdAt ?? null,
    requires_legal_guardian: params.isMinor,
    retention_until: null,
    rg: null,
    risk_level: null,
    status: params.status,
    suicide_risk_assessment: null,
    therapeutic_goals: null,
    total_sessions_count: null,
    treatment_plan: null,
    updated_at: params.updatedAt ?? null,
    updated_by: null,
  };

  return {
    ...row,
    displayName: params.displayName,
    avatarUrl: null,
    email: params.email,
    phone: params.phone,
    age: params.age,
    dateOfBirth: params.dateOfBirth,
    gender: params.gender,
  } as unknown as PatientWithDetails;
}

function resolveLegacyStatus(isActive: boolean, archivedAt: string | null): string {
  if (archivedAt) return "archived";
  return isActive ? "active" : "inactive";
}

export function adaptPatientSummaryToLegacyPatient(
  patient: PatientSummaryDTO,
  options?: { psychologistId?: string },
): PatientWithDetails {
  const status = patient.isActive ? "active" : "inactive";

  return createPatientBase({
    id: patient.id,
    psychologistId: options?.psychologistId ?? "",
    displayName: patient.displayName,
    email: patient.email,
    phone: patient.phone,
    dateOfBirth: null,
    age: null,
    gender: null,
    isMinor: patient.isMinor,
    status,
    defaultSessionPrice: patient.defaultSessionPrice,
    fullName: patient.displayName,
    preferredName: patient.displayName,
  });
}

export function adaptPatientSummariesToLegacyPatients(
  patients: readonly PatientSummaryDTO[],
  options?: { psychologistId?: string },
): PatientWithDetails[] {
  return patients.map((patient) => adaptPatientSummaryToLegacyPatient(patient, options));
}

export function adaptPatientDTOToLegacyPatient(patient: PatientDTO): PatientWithDetails {
  return createPatientBase({
    id: patient.id,
    psychologistId: patient.psychologistId,
    displayName: patient.displayName,
    email: patient.email,
    phone: patient.phone,
    dateOfBirth: patient.dateOfBirth,
    age: patient.age,
    gender: patient.gender,
    isMinor: patient.isMinor,
    status: resolveLegacyStatus(patient.isActive, patient.archivedAt),
    defaultSessionPrice: patient.defaultSessionPrice,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
    archivedAt: patient.archivedAt,
    firstName: patient.firstName,
    lastName: patient.lastName,
    preferredName: patient.preferredName,
    fullName: patient.fullName,
    cpf: patient.cpf,
    address: toAddressJson(patient.address),
    patientOrigin: patient.patientOrigin,
    preferredContactMethod: patient.preferredContactMethod,
    notificationsWhatsappSessionReminders: patient.notificationsWhatsappSessionReminders,
    isSynced: patient.isSynced,
    lastSynced: patient.lastSynced,
    attachedDocuments: (patient.attachedDocuments as Json | null | undefined) ?? null,
    clinicalNotes: patient.clinicalNotes,
  });
}

export function adaptPatientWithContactsDTOToLegacyPatient(
  patient: PatientWithContactsDTO,
): PatientWithDetails {
  const legacyPatient = adaptPatientDTOToLegacyPatient(patient);

  return {
    ...legacyPatient,
    emergency_contacts: toEmergencyContactsJson(patient.emergencyContacts),
  };
}
