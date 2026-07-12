/**
 * Utility functions to safely parse and validate JSON fields from Supabase.
 * These functions provide type safety when working with JSON columns that
 * store structured data like arrays of objects.
 */

import type {
  PatientClinicalCondition,
  PatientClinicalMedication,
} from "@workspace/supabase-data/types/entities";

/**
 * Type guard to check if an object is a valid PatientClinicalCondition.
 */
function isValidClinicalCondition(value: unknown): value is PatientClinicalCondition {
  if (!value || typeof value !== "object") {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.source === "string" &&
    (obj.conditionType === null ||
      obj.conditionType === undefined ||
      typeof obj.conditionType === "string") &&
    (obj.diagnosedDate === null ||
      obj.diagnosedDate === undefined ||
      typeof obj.diagnosedDate === "string") &&
    (obj.icd10Code === null || obj.icd10Code === undefined || typeof obj.icd10Code === "string") &&
    (obj.status === null || obj.status === undefined || typeof obj.status === "string") &&
    (obj.notes === null || obj.notes === undefined || typeof obj.notes === "string") &&
    (obj.createdAt === null || obj.createdAt === undefined || typeof obj.createdAt === "string") &&
    (obj.updatedAt === null || obj.updatedAt === undefined || typeof obj.updatedAt === "string")
  );
}

/**
 * Parses and validates a JSON field containing an array of clinical conditions.
 * Returns an empty array if the data is invalid or not an array.
 *
 * @param data - The JSON data from Supabase (can be null, undefined, or any type)
 * @returns An array of validated PatientClinicalCondition objects
 */
export function parseClinicalConditions(data: unknown): PatientClinicalCondition[] {
  if (!data) {
    return [];
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(isValidClinicalCondition);
}

/**
 * Type guard to check if an object is a valid PatientClinicalMedication.
 */
function isValidClinicalMedication(value: unknown): value is PatientClinicalMedication {
  if (!value || typeof value !== "object") {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.source === "string" &&
    (obj.dosage === null || obj.dosage === undefined || typeof obj.dosage === "string") &&
    (obj.frequency === null || obj.frequency === undefined || typeof obj.frequency === "string") &&
    (obj.route === null || obj.route === undefined || typeof obj.route === "string") &&
    (obj.startDate === null || obj.startDate === undefined || typeof obj.startDate === "string") &&
    (obj.endDate === null || obj.endDate === undefined || typeof obj.endDate === "string") &&
    (obj.isActive === null || obj.isActive === undefined || typeof obj.isActive === "boolean") &&
    (obj.prescribedBy === null ||
      obj.prescribedBy === undefined ||
      typeof obj.prescribedBy === "string") &&
    (obj.reason === null || obj.reason === undefined || typeof obj.reason === "string") &&
    (obj.notes === null || obj.notes === undefined || typeof obj.notes === "string") &&
    (obj.createdAt === null || obj.createdAt === undefined || typeof obj.createdAt === "string") &&
    (obj.updatedAt === null || obj.updatedAt === undefined || typeof obj.updatedAt === "string")
  );
}

/**
 * Parses and validates a JSON field containing an array of clinical medications.
 * Returns an empty array if the data is invalid or not an array.
 *
 * @param data - The JSON data from Supabase (can be null, undefined, or any type)
 * @returns An array of validated PatientClinicalMedication objects
 */
export function parseClinicalMedications(data: unknown): PatientClinicalMedication[] {
  if (!data) {
    return [];
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(isValidClinicalMedication);
}

/**
 * Type definition for PatientDocumentSummary (from app types).
 * This is kept here to avoid circular dependencies.
 */
export interface PatientDocumentSummary {
  id: string;
  label: string;
  type: string;
  status: "complete" | "pending" | "missing";
  url?: string;
  storagePath?: string;
  size?: string;
  uploadedAt?: string;
}

/**
 * Type guard to check if an object is a valid PatientDocumentSummary.
 */
function isValidPatientDocument(value: unknown): value is PatientDocumentSummary {
  if (!value || typeof value !== "object") {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    typeof obj.label === "string" &&
    typeof obj.type === "string" &&
    typeof obj.status === "string" &&
    (obj.status === "complete" || obj.status === "pending" || obj.status === "missing") &&
    (obj.url === null || obj.url === undefined || typeof obj.url === "string") &&
    (obj.storagePath === null ||
      obj.storagePath === undefined ||
      typeof obj.storagePath === "string") &&
    (obj.size === null || obj.size === undefined || typeof obj.size === "string") &&
    (obj.uploadedAt === null || obj.uploadedAt === undefined || typeof obj.uploadedAt === "string")
  );
}

/**
 * Parses and validates a JSON field containing an array of patient documents.
 * Returns an empty array if the data is invalid or not an array.
 *
 * @param data - The JSON data from Supabase (can be null, undefined, or any type)
 * @returns An array of validated PatientDocumentSummary objects
 */
export function parsePatientDocuments(data: unknown): PatientDocumentSummary[] {
  if (!data) {
    return [];
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(isValidPatientDocument);
}
