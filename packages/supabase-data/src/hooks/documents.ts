"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";
import { getGeneratedDocumentAction } from "../actions/documents/get-generated-document";
import { listDocumentTemplatesAction } from "../actions/documents/list-document-templates";
import { listGeneratedDocumentsAction } from "../actions/documents/list-generated-documents";
import { unwrapActionResult } from "../lib/boundary/unwrap-action";
import type { DocumentTemplate as ActionDocumentTemplate } from "../actions/documents/list-document-templates";
import type {
  GeneratedDocumentWithTemplate,
  GeneratedDocumentWithTemplateAndPatient,
} from "../types/entities";
import { queryKeys } from "../utils/query-keys";

export type DocumentTemplate = ActionDocumentTemplate;

const DocumentTemplatesResponseSchema = z.object({ templates: z.array(z.any()) });
const GeneratedDocumentsResponseSchema = z.object({ documents: z.array(z.any()) });
const GeneratedDocumentResponseSchema = z.object({ document: z.any().nullable().optional() });

function toLegacyGeneratedDocument(document: any): GeneratedDocumentWithTemplate {
  return {
    id: document.id,
    content: document.content,
    created_at: document.createdAt,
    created_by: document.createdBy,
    document_type: document.documentType,
    encoded_content: document.encodedContent,
    is_archived: document.isArchived,
    patient_id: document.patientId,
    psychologist_client_id: document.psychologistClientId,
    psychologist_id: document.psychologistId,
    tags: document.tags ? [...document.tags] : null,
    template_id: document.templateId,
    title: document.title,
    updated_at: document.updatedAt,
    updated_by: document.updatedBy,
    template: document.template ? { title: document.template.title } : null,
  };
}

function toLegacyGeneratedDocumentWithPatient(
  document: any,
): GeneratedDocumentWithTemplateAndPatient {
  return {
    ...toLegacyGeneratedDocument(document),
    patient: document.patient
      ? {
          id: document.patient.id,
          display_name: document.patient.displayName,
          first_name: document.patient.firstName,
          full_name: document.patient.fullName,
          last_name: document.patient.lastName,
          preferred_name: document.patient.preferredName,
        }
      : null,
  };
}

export function useDocumentTemplates(): UseQueryResult<DocumentTemplate[], Error> {
  return useQuery({
    queryKey: queryKeys.documents.templates(),
    queryFn: async () => {
      const data = unwrapActionResult(
        await listDocumentTemplatesAction({}),
        DocumentTemplatesResponseSchema,
      );
      return data.templates as DocumentTemplate[];
    },
    staleTime: 60 * 60 * 1000,
  });
}

export function usePatientGeneratedDocuments(
  patientId: string | undefined,
): UseQueryResult<GeneratedDocumentWithTemplate[], Error> {
  return useQuery({
    queryKey: queryKeys.documents.generated(patientId),
    queryFn: async () => {
      if (!patientId) return [];
      const data = unwrapActionResult(
        await listGeneratedDocumentsAction({ patientId }),
        GeneratedDocumentsResponseSchema,
      );
      return data.documents.map(toLegacyGeneratedDocument);
    },
    enabled: !!patientId,
    staleTime: 1 * 60 * 1000,
  });
}

export function useGeneratedDocument(
  documentId: string | undefined,
): UseQueryResult<GeneratedDocumentWithTemplateAndPatient | null, Error> {
  return useQuery({
    queryKey: queryKeys.documents.detail(documentId ?? ""),
    queryFn: async () => {
      if (!documentId) return null;
      const data = unwrapActionResult(
        await getGeneratedDocumentAction({ documentId }),
        GeneratedDocumentResponseSchema,
      );
      return data.document ? toLegacyGeneratedDocumentWithPatient(data.document) : null;
    },
    enabled: !!documentId,
    staleTime: 1 * 60 * 1000,
  });
}
