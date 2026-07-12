import type { PatientDocumentSummary } from "@/compat/supabase/utils/json-field-parsers";

export type PatientRecordType = "personal" | "identification" | "contact" | "emergency";
export interface PatientRecordField {
  key: string;
  label: string;
  value: string | number | boolean | null | undefined;
  required?: boolean;
  type?: "text" | "date" | "select" | "phone" | "email" | "boolean";
  options?: { label: string; value: string }[];
}
export interface PatientRecordSection {
  id: PatientRecordType;
  title: string;
  fields: PatientRecordField[];
  lastUpdated?: string;
}
// Re-export PatientDocumentSummary for use in other files
export type { PatientDocumentSummary };

export interface PatientRecordCollections {
  patientId: string;
  fullName: string;
  status?: string | null;
  avatarUrl?: string | null;

  // Section-specific overrides or direct access
  pronouns?: string;
  city?: string;
  state?: string;
  phone?: string;

  // Meta
  isDataIncomplete?: boolean;
  nextSessionAt?: string | null;
  lastSessionDate?: string | null;
  totalSessionsCount?: number | null;
  relationshipStartDate?: string | null;

  // Flags
  isMinor?: boolean;
  requiresLegalGuardian?: boolean;
  hasInformedConsent: boolean;
  hasClinicalNotes: boolean;

  // Financial
  defaultSessionPrice?: number;
  priceSetAt?: string;

  // Clinical
  currentMedicationsSummary?: string;
  socioeconomicContext?: string;

  // Invite
  inviteStatus?: "pending" | "accepted" | "expired" | null;
  invitedAt?: string | null;
  inviteExpiresAt?: string | null;
  inviteReminderCount?: number;

  sections: PatientRecordSection[];
  documentsSummary: PatientDocumentSummary[];
}
