import type { PatientDocumentDTO } from "../../domain/dto/patient-document.dto";
import type { Json } from "@workspace/supabase-infra/types/database";

/**
 * Mapper for converting between database JSON and domain DTOs
 *
 * This isolates database-specific types from domain logic.
 */

/**
 * Database representation of documents (stored as JSONB)
 */
interface DocumentJSON {
  id: string;
  label: string;
  type: string;
  status: string;
  storagePath: string;
  size: string;
  uploadedAt: string;
}

/**
 * Type guard for DocumentJSON
 */
function isDocumentJSON(value: unknown): value is DocumentJSON {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as DocumentJSON).id === "string" &&
    "label" in value &&
    typeof (value as DocumentJSON).label === "string" &&
    "storagePath" in value &&
    typeof (value as DocumentJSON).storagePath === "string"
  );
}

/**
 * Convert database JSON to domain DTO
 */
export function fromDatabaseJson(json: Json): readonly PatientDocumentDTO[] {
  // Handle null or invalid JSON
  if (!json || !Array.isArray(json)) {
    return [];
  }

  // Filter and map valid documents
  const documents: PatientDocumentDTO[] = [];

  for (const item of json) {
    if (isDocumentJSON(item)) {
      documents.push({
        id: item.id,
        label: item.label,
        type: item.type,
        status: normalizeStatus(item.status),
        storagePath: item.storagePath,
        size: item.size,
        uploadedAt: item.uploadedAt,
      });
    }
  }

  return documents;
}

/**
 * Convert domain DTOs to database JSON
 */
export function toDatabaseJson(documents: readonly PatientDocumentDTO[]): Json {
  return documents.map((doc) => ({
    id: doc.id,
    label: doc.label,
    type: doc.type,
    status: doc.status,
    storagePath: doc.storagePath,
    size: doc.size,
    uploadedAt: doc.uploadedAt,
  })) as Json;
}

/**
 * Normalize status to ensure type safety
 */
function normalizeStatus(status: string): "pending" | "complete" | "failed" {
  if (status === "pending" || status === "complete" || status === "failed") {
    return status;
  }
  // Default to complete for legacy data
  return "complete";
}

/**
 * Add a document to existing JSON array
 */
export function addDocumentToJson(existingJson: Json, newDocument: PatientDocumentDTO): Json {
  const existing = fromDatabaseJson(existingJson);
  const updated = [...existing, newDocument];
  return toDatabaseJson(updated);
}

/**
 * Remove a document from JSON array
 */
export function removeDocumentFromJson(existingJson: Json, documentId: string): Json {
  const existing = fromDatabaseJson(existingJson);
  const updated = existing.filter((doc) => doc.id !== documentId);
  return toDatabaseJson(updated);
}

/**
 * Update a document in JSON array
 */
export function updateDocumentInJson(
  existingJson: Json,
  documentId: string,
  updates: Partial<Pick<PatientDocumentDTO, "label" | "status">>,
): Json {
  const existing = fromDatabaseJson(existingJson);
  const updated = existing.map((doc) => (doc.id === documentId ? { ...doc, ...updates } : doc));
  return toDatabaseJson(updated);
}

/**
 * Find a document in JSON array
 */
export function findDocumentInJson(json: Json, documentId: string): PatientDocumentDTO | null {
  const documents = fromDatabaseJson(json);
  return documents.find((doc) => doc.id === documentId) ?? null;
}
