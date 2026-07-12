"use server";

import { encodeNote } from "@workspace/lexical-editor/utils/encoding";
import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { createGeneratedDocument } from "../../modules/documents/application/document-commands";
import type { GeneratedDocumentDTO } from "../../modules/documents/domain/dto/generated-document.dto";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { SubstitutionWarning } from "../../types/document-templates";
import { verifyPatientOwnership } from "../../utils/authorization";
import {
  buildSubstitutionContext,
  normalizeTemplateData,
  substituteTemplateVariables,
} from "../../utils/template-variables";

const createGeneratedDocumentRequestSchema = z
  .object({
    patientId: z.uuid(),
    templateId: z.uuid(),
    title: z.string().min(1).optional(),
  })
  .strict();

export type CreateGeneratedDocumentRequest = z.infer<typeof createGeneratedDocumentRequestSchema>;

export type CreateGeneratedDocumentResponse = {
  document: GeneratedDocumentDTO;
  warnings: SubstitutionWarning[];
};

export type CreateGeneratedDocumentPromise = Promise<
  SerializedResult<CreateGeneratedDocumentResponse>
>;

const _createGeneratedDocument = createAction<
  CreateGeneratedDocumentRequest,
  CreateGeneratedDocumentResponse
>({
  name: "documents.createGeneratedDocument",
  inputSchema: createGeneratedDocumentRequestSchema,
  handler: async (input, context) => {
    const { patientId, templateId, title } = input;
    const { supabase, userId } = context;

    const isOwner = await verifyPatientOwnership(supabase, userId, patientId);
    if (!isOwner) {
      return err(
        AppError.auth(
          AppErrorCode.AUTH_FORBIDDEN,
          "You do not have permission to access this patient",
        ),
      );
    }

    const { data: template, error: templateError } = await supabase
      .from("catalog_document_templates")
      .select("template_data, title")
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      return err(
        AppError.notFound(
          AppErrorCode.NOT_FOUND_RESOURCE,
          "Template not found",
          "document_template",
          templateId,
        ),
      );
    }

    const { data: patient, error: patientError } = await supabase
      .from("psychologist_patients")
      .select("*")
      .eq("id", patientId)
      .eq("psychologist_id", userId)
      .single();

    if (patientError || !patient) {
      return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
    }

    const { data: psychologist, error: psychologistError } = await supabase
      .from("user_psychologists")
      .select("*")
      .eq("id", userId)
      .single();

    if (psychologistError || !psychologist) {
      return err(AppError.notFound(AppErrorCode.NOT_FOUND_USER, "Psychologist not found"));
    }

    let guardian: Database["public"]["Tables"]["psychologist_patient_guardians"]["Row"] | null =
      null;
    if (patient.is_minor || patient.requires_legal_guardian) {
      const { data: guardianData } = await supabase
        .from("psychologist_patient_guardians")
        .select("*")
        .eq("patient_id", patientId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      guardian = guardianData;
    }

    const templateData = normalizeTemplateData(template.template_data);
    if (!templateData) {
      return err(
        AppError.validation(AppErrorCode.VALIDATION_INVALID_FORMAT, "Invalid template format", {
          templateId,
        }),
      );
    }

    const substitutionResult = substituteTemplateVariables(
      templateData,
      buildSubstitutionContext({ patient, psychologist, guardian }),
    );

    const createResult = await createGeneratedDocument(supabase, {
      patientId,
      psychologistId: userId,
      templateId,
      title: title ?? template.title,
      encodedContent: encodeNote(substitutionResult.substitutedContent),
      createdBy: userId,
    });

    if (createResult.isErr()) {
      return err(createResult.error);
    }

    const document = createResult.value;
    return ok({
      document,
      warnings: substitutionResult.warnings,
    });
  },
});

export async function createGeneratedDocumentAction(
  input: CreateGeneratedDocumentRequest,
): Promise<SerializedResult<CreateGeneratedDocumentResponse>> {
  const result = await _createGeneratedDocument(input);
  return serializeResult(result);
}
