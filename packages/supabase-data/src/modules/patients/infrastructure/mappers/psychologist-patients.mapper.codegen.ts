// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistPatientsDTOSchema,
  type PsychologistPatientsDTO,
} from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patients.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistPatientsRow = Database["public"]["Tables"]["psychologist_patients"]["Row"]
type PsychologistPatientsInsert = Database["public"]["Tables"]["psychologist_patients"]["Insert"]
type PsychologistPatientsUpdate = Database["public"]["Tables"]["psychologist_patients"]["Update"]

const PsychologistPatientsFieldMappings = {
  archivedAt: "archived_at",
  archivedBy: "archived_by",
  attachedDocuments: "attached_documents",
  clinicalHypothesis: "clinical_hypothesis",
  clinicalNotes: "clinical_notes",
  createdAt: "created_at",
  createdBy: "created_by",
  currentMedications: "current_medications",
  dataSharingConsent: "data_sharing_consent",
  dataSharingConsentDate: "data_sharing_consent_date",
  defaultSessionPrice: "default_session_price",
  deletedAt: "deleted_at",
  deletedBy: "deleted_by",
  dischargeReason: "discharge_reason",
  disorders: "disorders",
  firstSessionDate: "first_session_date",
  id: "id",
  informedConsentDate: "informed_consent_date",
  informedConsentDocumentUrl: "informed_consent_document_url",
  informedConsentSigned: "informed_consent_signed",
  initialComplaint: "initial_complaint",
  inviteExpiresAt: "invite_expires_at",
  inviteReminderCount: "invite_reminder_count",
  inviteReminderSentAt: "invite_reminder_sent_at",
  inviteSentVia: "invite_sent_via",
  inviteStatus: "invite_status",
  inviteToken: "invite_token",
  invitedAt: "invited_at",
  isMinor: "is_minor",
  knownAllergies: "known_allergies",
  lastSessionDate: "last_session_date",
  manualAddress: "manual_address",
  manualCpf: "manual_cpf",
  manualDateOfBirth: "manual_date_of_birth",
  manualDisplayName: "manual_display_name",
  manualEmail: "manual_email",
  manualEmergencyContacts: "manual_emergency_contacts",
  manualFirstName: "manual_first_name",
  manualFullName: "manual_full_name",
  manualGender: "manual_gender",
  manualLastName: "manual_last_name",
  manualPatientOrigin: "manual_patient_origin",
  manualPhone: "manual_phone",
  manualPlaceOfBirth: "manual_place_of_birth",
  manualPreferredName: "manual_preferred_name",
  manualProfession: "manual_profession",
  manualPronouns: "manual_pronouns",
  manualRg: "manual_rg",
  patientId: "patient_id",
  preferredContactMethod: "preferred_contact_method",
  priceSetAt: "price_set_at",
  priceSetBy: "price_set_by",
  psychologistId: "psychologist_id",
  recoveryDeadline: "recovery_deadline",
  relationshipEndDate: "relationship_end_date",
  relationshipStartDate: "relationship_start_date",
  requiresLegalGuardian: "requires_legal_guardian",
  retentionUntil: "retention_until",
  riskLevel: "risk_level",
  status: "status",
  suicideRiskAssessment: "suicide_risk_assessment",
  syncedAddress: "synced_address",
  syncedCpf: "synced_cpf",
  syncedDateOfBirth: "synced_date_of_birth",
  syncedDisplayName: "synced_display_name",
  syncedEmail: "synced_email",
  syncedFullName: "synced_full_name",
  syncedGender: "synced_gender",
  syncedPhone: "synced_phone",
  syncedPlaceOfBirth: "synced_place_of_birth",
  syncedProfession: "synced_profession",
  syncedPronouns: "synced_pronouns",
  syncedRg: "synced_rg",
  therapeuticGoals: "therapeutic_goals",
  totalSessionsCount: "total_sessions_count",
  treatmentPlan: "treatment_plan",
  updatedAt: "updated_at",
  updatedBy: "updated_by",
} as const

type PsychologistPatientsField = keyof typeof PsychologistPatientsFieldMappings

function fromPsychologistPatientsRow(row: PsychologistPatientsRow): PsychologistPatientsDTO {
  const mapped = {
    archivedAt: row.archived_at,
    archivedBy: row.archived_by,
    attachedDocuments: row.attached_documents,
    clinicalHypothesis: row.clinical_hypothesis,
    clinicalNotes: row.clinical_notes,
    createdAt: row.created_at,
    createdBy: row.created_by,
    currentMedications: row.current_medications,
    dataSharingConsent: row.data_sharing_consent,
    dataSharingConsentDate: row.data_sharing_consent_date,
    defaultSessionPrice: row.default_session_price,
    deletedAt: row.deleted_at,
    deletedBy: row.deleted_by,
    dischargeReason: row.discharge_reason,
    disorders: row.disorders,
    firstSessionDate: row.first_session_date,
    id: row.id,
    informedConsentDate: row.informed_consent_date,
    informedConsentDocumentUrl: row.informed_consent_document_url,
    informedConsentSigned: row.informed_consent_signed,
    initialComplaint: row.initial_complaint,
    inviteExpiresAt: row.invite_expires_at,
    inviteReminderCount: row.invite_reminder_count,
    inviteReminderSentAt: row.invite_reminder_sent_at,
    inviteSentVia: row.invite_sent_via,
    inviteStatus: row.invite_status,
    inviteToken: row.invite_token,
    invitedAt: row.invited_at,
    isMinor: row.is_minor,
    knownAllergies: row.known_allergies,
    lastSessionDate: row.last_session_date,
    manualAddress: row.manual_address,
    manualCpf: row.manual_cpf,
    manualDateOfBirth: row.manual_date_of_birth,
    manualDisplayName: row.manual_display_name,
    manualEmail: row.manual_email,
    manualEmergencyContacts: row.manual_emergency_contacts,
    manualFirstName: row.manual_first_name,
    manualFullName: row.manual_full_name,
    manualGender: row.manual_gender,
    manualLastName: row.manual_last_name,
    manualPatientOrigin: row.manual_patient_origin,
    manualPhone: row.manual_phone,
    manualPlaceOfBirth: row.manual_place_of_birth,
    manualPreferredName: row.manual_preferred_name,
    manualProfession: row.manual_profession,
    manualPronouns: row.manual_pronouns,
    manualRg: row.manual_rg,
    patientId: row.patient_id,
    preferredContactMethod: row.preferred_contact_method,
    priceSetAt: row.price_set_at,
    priceSetBy: row.price_set_by,
    psychologistId: row.psychologist_id,
    recoveryDeadline: row.recovery_deadline,
    relationshipEndDate: row.relationship_end_date,
    relationshipStartDate: row.relationship_start_date,
    requiresLegalGuardian: row.requires_legal_guardian,
    retentionUntil: row.retention_until,
    riskLevel: row.risk_level,
    status: row.status,
    suicideRiskAssessment: row.suicide_risk_assessment,
    syncedAddress: row.synced_address,
    syncedCpf: row.synced_cpf,
    syncedDateOfBirth: row.synced_date_of_birth,
    syncedDisplayName: row.synced_display_name,
    syncedEmail: row.synced_email,
    syncedFullName: row.synced_full_name,
    syncedGender: row.synced_gender,
    syncedPhone: row.synced_phone,
    syncedPlaceOfBirth: row.synced_place_of_birth,
    syncedProfession: row.synced_profession,
    syncedPronouns: row.synced_pronouns,
    syncedRg: row.synced_rg,
    therapeuticGoals: row.therapeutic_goals,
    totalSessionsCount: row.total_sessions_count,
    treatmentPlan: row.treatment_plan,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  }
  return PsychologistPatientsDTOSchema.parse(mapped)
}

function toPsychologistPatientsInsert(
  dto: Partial<PsychologistPatientsDTO>
): PsychologistPatientsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(PsychologistPatientsFieldMappings) as Array<
    [
      PsychologistPatientsField,
      (typeof PsychologistPatientsFieldMappings)[PsychologistPatientsField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistPatientsInsert
}

function toPsychologistPatientsUpdate(
  dto: Partial<PsychologistPatientsDTO>
): PsychologistPatientsUpdate {
  return toPsychologistPatientsInsert(dto) as PsychologistPatientsUpdate
}

export { fromPsychologistPatientsRow, toPsychologistPatientsInsert, toPsychologistPatientsUpdate }
