import type { PatientWithDetails, UpdatePatientInput } from "../types/entities";
import { buildPatientDisplayName } from "../utils/patient-display-name";

export function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;

  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function sanitizeString(value?: string) {
  if (value === undefined) return undefined;
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function applyPatientInput(
  patient: PatientWithDetails,
  input: UpdatePatientInput,
): PatientWithDetails {
  const updated = { ...patient };

  if (input.fullName !== undefined) {
    updated.full_name = sanitizeString(input.fullName) ?? null;
  }
  if (input.firstName !== undefined) {
    updated.first_name = sanitizeString(input.firstName) ?? null;
  }
  if (input.lastName !== undefined) {
    updated.last_name = sanitizeString(input.lastName) ?? null;
  }
  if (input.preferredName !== undefined) {
    updated.preferred_name = sanitizeString(input.preferredName) ?? null;
  }
  if (input.email !== undefined) {
    updated.email = sanitizeString(input.email) ?? null;
  }
  if (input.phone !== undefined) {
    updated.phone = sanitizeString(input.phone) ?? null;
  }
  if (input.dateOfBirth !== undefined) {
    updated.date_of_birth = input.dateOfBirth || null;
    const age = calculateAge(updated.date_of_birth);
    if (age !== null) {
      updated.is_minor = age < 18;
      updated.requires_legal_guardian = age < 18;
    }
  }
  if (input.cpf !== undefined) {
    updated.cpf = sanitizeString(input.cpf) ?? null;
  }
  if (input.gender !== undefined) {
    updated.gender = sanitizeString(input.gender) ?? null;
  }
  if (input.preferredContactMethod !== undefined) {
    updated.preferred_contact_method = sanitizeString(
      input.preferredContactMethod,
    ) as typeof updated.preferred_contact_method;
  }
  if (input.patientOrigin !== undefined) {
    updated.patient_origin = sanitizeString(input.patientOrigin) ?? null;
  }
  if (input.address !== undefined) {
    updated.address = input.address ? { ...input.address } : null;
  }
  const hasEmergencyContacts = Object.prototype.hasOwnProperty.call(input, "emergencyContacts");
  if (hasEmergencyContacts) {
    updated.emergency_contacts = input.emergencyContacts
      ? JSON.parse(JSON.stringify(input.emergencyContacts))
      : null;
  }
  if (input.clinicalNotes !== undefined) {
    updated.clinical_notes = input.clinicalNotes || null;
  }
  if (input.defaultSessionPrice !== undefined) {
    updated.default_session_price = input.defaultSessionPrice;
  }
  if (input.attachedDocuments !== undefined) {
    updated.attached_documents = input.attachedDocuments
      ? (JSON.parse(JSON.stringify(input.attachedDocuments)) as typeof updated.attached_documents)
      : null;
  }
  if (input.notificationsWhatsappSessionReminders !== undefined) {
    updated.notifications_whatsapp_session_reminders = input.notificationsWhatsappSessionReminders;
  }

  const dateOfBirth = updated.date_of_birth ?? null;
  const age = calculateAge(dateOfBirth);

  const derivedDisplayName = buildPatientDisplayName({
    name: updated.first_name,
    surname: updated.last_name,
    preferredName: updated.preferred_name,
  });
  if (derivedDisplayName !== null) {
    updated.display_name = derivedDisplayName;
  }

  updated.is_synced = false;
  updated.last_synced = null;

  return {
    ...updated,
    updated_at: new Date().toISOString(),
    displayName:
      updated.display_name ??
      derivedDisplayName ??
      updated.full_name ??
      [updated.first_name, updated.last_name].filter(Boolean).join(" ").trim() ??
      "Paciente",
    email: updated.email,
    phone: updated.phone,
    gender: updated.gender,
    dateOfBirth,
    age,
  };
}
