import { ok, err, type Result } from "neverthrow";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentRepository } from "../../domain/ports/document-repository.port";
import type {
  PatientDocumentDTO,
  PatientDocumentsDTO,
} from "../../domain/dto/patient-document.dto";
import type {
  CreateGeneratedDocumentDTO,
  GeneratedDocumentDTO,
  GeneratedDocumentPatientDTO,
  GeneratedDocumentTemplateDTO,
  GeneratedDocumentWithTemplateAndPatientDTO,
  GeneratedDocumentWithTemplateDTO,
} from "../../domain/dto/generated-document.dto";
import { AppError, AppErrorCode } from "../../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import {
  fromDatabaseJson,
  addDocumentToJson,
  removeDocumentFromJson,
  updateDocumentInJson,
  findDocumentInJson,
} from "../mappers/document.mapper";

type GeneratedDocumentRow = Database["public"]["Tables"]["generated_documents"]["Row"];
type GeneratedDocumentInsert = Database["public"]["Tables"]["generated_documents"]["Insert"];
type GeneratedDocumentUpdate = Database["public"]["Tables"]["generated_documents"]["Update"];

type TemplateRelation = {
  title: string;
  template_category?: string | null;
};

type PatientRelation = {
  id: string;
  manual_display_name: string | null;
  manual_first_name: string | null;
  manual_full_name: string | null;
  manual_last_name: string | null;
  manual_preferred_name: string | null;
  synced_display_name: string | null;
  synced_full_name: string | null;
};

function unwrapRelation<T>(relation: T | readonly T[] | null | undefined): T | null {
  if (Array.isArray(relation)) {
    return (relation[0] ?? null) as T | null;
  }
  return (relation ?? null) as T | null;
}

function toGeneratedDocumentDTO(row: GeneratedDocumentRow): GeneratedDocumentDTO {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    createdBy: row.created_by ?? row.psychologist_id,
    documentType: row.document_type,
    encodedContent: row.encoded_content ?? "",
    isArchived: row.is_archived,
    patientId: row.patient_id ?? row.psychologist_client_id ?? "",
    psychologistClientId: row.psychologist_client_id,
    psychologistId: row.psychologist_id,
    tags: row.tags,
    templateId: row.template_id,
    title: row.title ?? "Documento",
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

function toTemplateDTO(template: TemplateRelation | null): GeneratedDocumentTemplateDTO | null {
  if (!template) {
    return null;
  }
  return {
    title: template.title,
    templateCategory: template.template_category ?? null,
  };
}

function toPatientDTO(patient: PatientRelation | null): GeneratedDocumentPatientDTO | null {
  if (!patient) {
    return null;
  }
  return {
    id: patient.id,
    displayName: patient.manual_display_name ?? patient.synced_display_name,
    firstName: patient.manual_first_name,
    fullName: patient.manual_full_name ?? patient.synced_full_name,
    lastName: patient.manual_last_name,
    preferredName: patient.manual_preferred_name,
  };
}

/**
 * Supabase implementation of DocumentRepository
 *
 * This is the ONLY file that imports Database types from database.types.ts
 * All other layers work with domain DTOs.
 */
export class DocumentSupabaseRepository implements DocumentRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findByPatientId(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientDocumentsDTO, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from("psychologist_patients")
        .select("id, attached_documents")
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId)
        .single();

      if (error) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch patient documents"),
        );
      }

      if (!data) {
        return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
      }

      const documents = fromDatabaseJson(data.attached_documents);

      return ok({
        patientId,
        documents,
        totalCount: documents.length,
      });
    } catch (_error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error fetching documents"),
      );
    }
  }

  async findById(
    documentId: string,
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientDocumentDTO | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from("psychologist_patients")
        .select("attached_documents")
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId)
        .single();

      if (error) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch document"));
      }

      if (!data) {
        return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
      }

      const document = findDocumentInJson(data.attached_documents, documentId);
      return ok(document);
    } catch (_error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error fetching document"));
    }
  }

  async addDocument(
    patientId: string,
    psychologistId: string,
    document: PatientDocumentDTO,
  ): Promise<Result<PatientDocumentDTO, AppError>> {
    try {
      // 1. Fetch current documents
      const { data: currentData, error: fetchError } = await this.supabase
        .from("psychologist_patients")
        .select("attached_documents")
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId)
        .single();

      if (fetchError) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch current documents"),
        );
      }

      if (!currentData) {
        return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
      }

      // 2. Add new document
      const updatedJson = addDocumentToJson(currentData.attached_documents, document);

      // 3. Update database
      const { error: updateError } = await this.supabase
        .from("psychologist_patients")
        .update({ attached_documents: updatedJson })
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId);

      if (updateError) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to save document"));
      }

      return ok(document);
    } catch (_error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error adding document"));
    }
  }

  async removeDocument(
    documentId: string,
    patientId: string,
    psychologistId: string,
  ): Promise<Result<void, AppError>> {
    try {
      // 1. Fetch current documents
      const { data: currentData, error: fetchError } = await this.supabase
        .from("psychologist_patients")
        .select("attached_documents")
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId)
        .single();

      if (fetchError) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch current documents"),
        );
      }

      if (!currentData) {
        return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
      }

      // 2. Remove document
      const updatedJson = removeDocumentFromJson(currentData.attached_documents, documentId);

      // 3. Update database
      const { error: updateError } = await this.supabase
        .from("psychologist_patients")
        .update({ attached_documents: updatedJson })
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId);

      if (updateError) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to remove document"));
      }

      return ok(undefined);
    } catch (_error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error removing document"));
    }
  }

  async updateDocument(
    documentId: string,
    patientId: string,
    psychologistId: string,
    updates: Partial<Pick<PatientDocumentDTO, "label" | "status">>,
  ): Promise<Result<PatientDocumentDTO, AppError>> {
    try {
      // 1. Fetch current documents
      const { data: currentData, error: fetchError } = await this.supabase
        .from("psychologist_patients")
        .select("attached_documents")
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId)
        .single();

      if (fetchError) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch current documents"),
        );
      }

      if (!currentData) {
        return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
      }

      // 2. Check if document exists
      const existingDoc = findDocumentInJson(currentData.attached_documents, documentId);
      if (!existingDoc) {
        return err(AppError.notFound(AppErrorCode.NOT_FOUND_DOCUMENT, "Document not found"));
      }

      // 3. Update document
      const updatedJson = updateDocumentInJson(currentData.attached_documents, documentId, updates);

      // 4. Save to database
      const { error: updateError } = await this.supabase
        .from("psychologist_patients")
        .update({ attached_documents: updatedJson })
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId);

      if (updateError) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to update document"));
      }

      // 5. Return updated document
      const updatedDoc: PatientDocumentDTO = { ...existingDoc, ...updates };
      return ok(updatedDoc);
    } catch (_error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error updating document"));
    }
  }

  async findGeneratedDocumentsByPatient(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<readonly GeneratedDocumentWithTemplateDTO[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from("generated_documents")
        .select(
          `
          *,
          template:catalog_document_templates!generated_documents_template_id_fkey(title, template_category)
        `,
        )
        .eq("patient_id", patientId)
        .eq("psychologist_id", psychologistId)
        .order("created_at", { ascending: false });

      if (error) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch generated documents", error),
        );
      }

      const documents: readonly GeneratedDocumentWithTemplateDTO[] = (data ?? []).map((row) => {
        const rowWithTemplate = row as GeneratedDocumentRow & {
          template: TemplateRelation | readonly TemplateRelation[] | null;
        };
        return {
          ...toGeneratedDocumentDTO(rowWithTemplate),
          template: toTemplateDTO(unwrapRelation(rowWithTemplate.template)),
        };
      });

      return ok(documents);
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error fetching generated documents",
          error,
        ),
      );
    }
  }

  async findGeneratedDocumentById(
    documentId: string,
    psychologistId: string,
  ): Promise<Result<GeneratedDocumentWithTemplateAndPatientDTO | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from("generated_documents")
        .select(
          `
          *,
          template:catalog_document_templates!generated_documents_template_id_fkey(title, template_category),
          patient:psychologist_patients!generated_documents_patient_id_fkey(
            id,
            manual_display_name,
            manual_first_name,
            manual_full_name,
            manual_last_name,
            manual_preferred_name,
            synced_display_name,
            synced_full_name
          )
        `,
        )
        .eq("id", documentId)
        .eq("psychologist_id", psychologistId)
        .maybeSingle();

      if (error) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch generated document", error),
        );
      }

      if (!data) {
        return ok(null);
      }

      const row = data as GeneratedDocumentRow & {
        template: TemplateRelation | readonly TemplateRelation[] | null;
        patient: PatientRelation | readonly PatientRelation[] | null;
      };

      return ok({
        ...toGeneratedDocumentDTO(row),
        template: toTemplateDTO(unwrapRelation(row.template)),
        patient: toPatientDTO(unwrapRelation(row.patient)),
      });
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error fetching generated document",
          error,
        ),
      );
    }
  }

  async createGeneratedDocument(
    input: CreateGeneratedDocumentDTO,
  ): Promise<Result<GeneratedDocumentDTO, AppError>> {
    try {
      const insertData: GeneratedDocumentInsert = {
        patient_id: input.patientId,
        psychologist_id: input.psychologistId,
        template_id: input.templateId,
        title: input.title,
        encoded_content: input.encodedContent,
        created_by: input.createdBy,
        content: input.content ?? null,
        document_type: input.documentType ?? null,
        is_archived: input.isArchived ?? false,
        psychologist_client_id: input.psychologistClientId ?? null,
        tags: input.tags ? [...input.tags] : null,
      };

      const { data, error } = await this.supabase
        .from("generated_documents")
        .insert(insertData)
        .select("*")
        .single();

      if (error) {
        return err(
          AppError.infra(
            AppErrorCode.DOCUMENTS_CREATE_FAILED,
            "Failed to create generated document",
            {
              originalError: error.message,
            },
          ),
        );
      }

      return ok(toGeneratedDocumentDTO(data));
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error creating generated document",
          error,
        ),
      );
    }
  }

  async updateGeneratedDocument(
    documentId: string,
    psychologistId: string,
    updates: Partial<Pick<GeneratedDocumentDTO, "title" | "encodedContent">>,
  ): Promise<Result<GeneratedDocumentDTO, AppError>> {
    try {
      const updateData: GeneratedDocumentUpdate = {
        updated_at: new Date().toISOString(),
        updated_by: psychologistId,
      };

      if (updates.title !== undefined) {
        updateData.title = updates.title;
      }

      if (updates.encodedContent !== undefined) {
        updateData.encoded_content = updates.encodedContent;
      }

      const { data, error } = await this.supabase
        .from("generated_documents")
        .update(updateData)
        .eq("id", documentId)
        .eq("psychologist_id", psychologistId)
        .select("*")
        .maybeSingle();

      if (error) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to update generated document", error),
        );
      }

      if (!data) {
        return err(AppError.notFound(AppErrorCode.NOT_FOUND_DOCUMENT, "Document not found"));
      }

      return ok(toGeneratedDocumentDTO(data));
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error updating generated document",
          error,
        ),
      );
    }
  }

  async renameGeneratedDocument(
    documentId: string,
    psychologistId: string,
    title: string,
  ): Promise<Result<GeneratedDocumentDTO, AppError>> {
    return this.updateGeneratedDocument(documentId, psychologistId, { title });
  }

  async deleteGeneratedDocument(
    documentId: string,
    psychologistId: string,
  ): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.supabase
        .from("generated_documents")
        .delete()
        .eq("id", documentId)
        .eq("psychologist_id", psychologistId);

      if (error) {
        return err(
          AppError.infra(
            AppErrorCode.DOCUMENTS_DELETE_FAILED,
            "Failed to delete generated document",
            {
              originalError: error.message,
            },
          ),
        );
      }

      return ok(undefined);
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error deleting generated document",
          error,
        ),
      );
    }
  }
}
