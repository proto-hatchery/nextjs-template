"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { listGeneratedDocumentsForPatient } from "../../modules/documents/application/document-queries";
import type { GeneratedDocumentWithTemplateDTO } from "../../modules/documents/domain/dto/generated-document.dto";
import { verifyPatientOwnership } from "../../utils/authorization";

const listGeneratedDocumentsRequestSchema = z
  .object({
    patientId: z.uuid(),
  })
  .strict();

export type ListGeneratedDocumentsRequest = z.infer<typeof listGeneratedDocumentsRequestSchema>;

export type ListGeneratedDocumentsResponse = {
  documents: readonly GeneratedDocumentWithTemplateDTO[];
};

export type ListGeneratedDocumentsPromise = Promise<
  SerializedResult<ListGeneratedDocumentsResponse>
>;

const _listGeneratedDocuments = createAction<
  ListGeneratedDocumentsRequest,
  ListGeneratedDocumentsResponse
>({
  name: "documents.listGeneratedDocuments",
  inputSchema: listGeneratedDocumentsRequestSchema,
  handler: async (input, context) => {
    const isOwner = await verifyPatientOwnership(context.supabase, context.userId, input.patientId);
    if (!isOwner) {
      return err(
        AppError.auth(
          AppErrorCode.AUTH_FORBIDDEN,
          "You do not have permission to access this patient",
        ),
      );
    }

    const result = await listGeneratedDocumentsForPatient(
      context.supabase,
      input.patientId,
      context.userId,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ documents: result.value });
  },
});

export async function listGeneratedDocumentsAction(
  input: ListGeneratedDocumentsRequest,
): Promise<SerializedResult<ListGeneratedDocumentsResponse>> {
  const result = await _listGeneratedDocuments(input);
  return serializeResult(result);
}
