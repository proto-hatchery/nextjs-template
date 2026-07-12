"use server";

import { ok, err } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { verifyPatientOwnership } from "../../utils/authorization";
import { DocumentSupabaseRepository } from "../../modules/documents/infrastructure/repositories/document-supabase.repository";

/**
 * Request DTO for deleting a patient document
 */
const deletePatientDocumentRequestSchema = z.object({
  patientId: z.uuid(),
  documentId: z.uuid(),
});

export type DeletePatientDocumentRequest = z.infer<typeof deletePatientDocumentRequestSchema>;

/**
 * Response DTO for deleting a patient document
 */
export type DeletePatientDocumentResponse = {
  success: true;
};

/**
 * Promise type for deleting a patient document
 */
export type DeletePatientDocumentPromise = Promise<SerializedResult<DeletePatientDocumentResponse>>;

const _deletePatientDocumentAction = createAction<
  DeletePatientDocumentRequest,
  DeletePatientDocumentResponse
>({
  name: "deletePatientDocument",
  inputSchema: deletePatientDocumentRequestSchema,
  handler: async (input, context) => {
    const { patientId, documentId } = input;
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

    // 2. Remove via repository (handles storage cleanup too)
    const repository = new DocumentSupabaseRepository(supabase);
    const removeResult = await repository.removeDocument(documentId, patientId, userId);

    if (removeResult.isErr()) {
      return err(removeResult.error);
    }

    return ok({ success: true });
  },
});

/**
 * Delete a patient document
 *
 * **Architecture Note:** This action uses the Repository Pattern.
 * - Repository: DocumentSupabaseRepository (infrastructure)
 * - Domain DTOs: PatientDocumentDTO
 *
 * @example
 * ```typescript
 * const result = await deletePatientDocumentAction({
 *   patientId: "123",
 *   documentId: "doc-456",
 * });
 *
 * if (result.isOk()) {
 *   console.log("Document deleted");
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export async function deletePatientDocumentAction(
  input: DeletePatientDocumentRequest,
): Promise<SerializedResult<DeletePatientDocumentResponse>> {
  const result = await _deletePatientDocumentAction(input);
  return serializeResult(result);
}
