"use server";

import { ok, err } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { verifyPatientOwnership } from "../../utils/authorization";
import { sanitizeFilename, validateFile, validateFileContent } from "../../utils/file-validation";
import { DocumentSupabaseRepository } from "../../modules/documents/infrastructure/repositories/document-supabase.repository";
import type { PatientDocumentDTO } from "../../modules/documents/domain/dto/patient-document.dto";

/**
 * Request DTO for creating a patient document
 */
const createPatientDocumentRequestSchema = z.object({
  patientId: z.uuid(),
  name: z.string().min(1, "Document name is required"),
  file: z.instanceof(File).nullable().optional(),
});

export type CreatePatientDocumentRequest = z.infer<typeof createPatientDocumentRequestSchema>;

/**
 * Response DTO for creating a patient document
 */
export type CreatePatientDocumentResponse = {
  document: PatientDocumentDTO;
};

/**
 * Promise type for creating a patient document
 */
export type CreatePatientDocumentPromise = Promise<SerializedResult<CreatePatientDocumentResponse>>;

const _createPatientDocumentAction = createAction<
  CreatePatientDocumentRequest,
  CreatePatientDocumentResponse
>({
  name: "createPatientDocument",
  inputSchema: createPatientDocumentRequestSchema,
  handler: async (input, context) => {
    const { patientId, name, file } = input;
    const { userId, supabase } = context;

    // 1. Verify patient ownership
    const isOwner = await verifyPatientOwnership(supabase, userId, patientId);
    if (!isOwner) {
      return err(
        AppError.auth(
          AppErrorCode.AUTH_FORBIDDEN,
          "You do not have permission to access this patient",
        ),
      );
    }

    // 2. Validate file presence
    if (!file) {
      return err(
        AppError.validation(AppErrorCode.VALIDATION_MISSING_FIELD, "File is required", {
          field: "file",
          reason: "No file provided",
        }),
      );
    }

    // 3. Validate file metadata
    const validation = validateFile(file);
    if (!validation.valid) {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_INVALID_FORMAT,
          validation.error || "Invalid file",
          { field: "file", reason: validation.error || "Invalid file" },
        ),
      );
    }

    // 4. Validate file content (magic numbers)
    const contentValidation = await validateFileContent(file, validation.mimeType);
    if (!contentValidation.valid) {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_INVALID_FORMAT,
          contentValidation.error || "Invalid file content",
          { field: "file", reason: contentValidation.error || "Invalid file content" },
        ),
      );
    }

    // 5. Upload to storage with sanitized name
    const sanitizedName = sanitizeFilename(name);
    const storagePath = `${userId}/${patientId}/${Date.now()}-${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from("patient-documents")
      .upload(storagePath, file, {
        contentType: validation.mimeType,
        upsert: false,
      });

    if (uploadError) {
      return err(
        AppError.infra(AppErrorCode.DOCUMENTS_UPLOAD_FAILED, "Failed to upload document", {
          originalError: uploadError.message,
        }),
      );
    }

    // 6. Create domain DTO (business model)
    const newDocument: PatientDocumentDTO = {
      id: crypto.randomUUID(),
      label: sanitizedName,
      type: validation.mimeType,
      status: "complete",
      storagePath,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      uploadedAt: new Date().toISOString(),
    };

    // 7. Persist via repository (infrastructure layer)
    const repository = new DocumentSupabaseRepository(supabase);
    const addResult = await repository.addDocument(patientId, userId, newDocument);

    if (addResult.isErr()) {
      // Clean up uploaded file on database failure
      await supabase.storage.from("patient-documents").remove([storagePath]);
      return err(addResult.error);
    }

    // 8. Return domain DTO directly (no mapping needed)
    return ok({ document: addResult.value });
  },
});

/**
 * Create a patient document with file upload
 *
 * **Architecture Note:** This action demonstrates Phase 5 (Repository Pattern).
 * - Domain DTO: PatientDocumentDTO (business model)
 * - Repository: DocumentSupabaseRepository (infrastructure)
 * - No Database types in this file
 *
 * @example
 * ```typescript
 * const result = await createPatientDocumentAction({
 *   patientId: "123",
 *   name: "Medical Report",
 *   file: fileObject,
 * });
 *
 * if (result.isOk()) {
 *   console.log("Document created:", result.value.document);
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export async function createPatientDocumentAction(
  input: CreatePatientDocumentRequest,
): Promise<SerializedResult<CreatePatientDocumentResponse>> {
  const result = await _createPatientDocumentAction(input);
  return serializeResult(result);
}
