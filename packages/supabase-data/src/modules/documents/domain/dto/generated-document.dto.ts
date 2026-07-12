/**
 * Domain DTO for generated documents
 */

export interface GeneratedDocumentDTO {
  readonly id: string;
  readonly content: string | null;
  readonly createdAt: string | null;
  readonly createdBy: string;
  readonly documentType: string | null;
  readonly encodedContent: string;
  readonly isArchived: boolean | null;
  readonly patientId: string;
  readonly psychologistClientId: string | null;
  readonly psychologistId: string;
  readonly tags: readonly string[] | null;
  readonly templateId: string | null;
  readonly title: string;
  readonly updatedAt: string | null;
  readonly updatedBy: string | null;
}

export interface CreateGeneratedDocumentDTO {
  readonly patientId: string;
  readonly psychologistId: string;
  readonly templateId: string | null;
  readonly title: string;
  readonly encodedContent: string;
  readonly createdBy: string;
  readonly content?: string | null;
  readonly documentType?: string | null;
  readonly isArchived?: boolean | null;
  readonly psychologistClientId?: string | null;
  readonly tags?: readonly string[] | null;
}

export interface GeneratedDocumentTemplateDTO {
  readonly title: string;
  readonly templateCategory: string | null;
}

export interface GeneratedDocumentPatientDTO {
  readonly id: string;
  readonly displayName: string | null;
  readonly firstName: string | null;
  readonly fullName: string | null;
  readonly lastName: string | null;
  readonly preferredName: string | null;
}

export interface GeneratedDocumentWithTemplateDTO extends GeneratedDocumentDTO {
  readonly template: GeneratedDocumentTemplateDTO | null;
}

export interface GeneratedDocumentWithTemplateAndPatientDTO extends GeneratedDocumentWithTemplateDTO {
  readonly patient: GeneratedDocumentPatientDTO | null;
}

export function isGeneratedDocumentDTO(value: unknown): value is GeneratedDocumentDTO {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "patientId" in value &&
    typeof value.patientId === "string" &&
    "psychologistId" in value &&
    typeof value.psychologistId === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "encodedContent" in value &&
    typeof value.encodedContent === "string"
  );
}
