"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { getGeneratedDocumentById } from "../../modules/documents/application/document-queries";
import type { GeneratedDocumentWithTemplateAndPatientDTO } from "../../modules/documents/domain/dto/generated-document.dto";

const getGeneratedDocumentRequestSchema = z
  .object({
    documentId: z.uuid(),
  })
  .strict();

export type GetGeneratedDocumentRequest = z.infer<typeof getGeneratedDocumentRequestSchema>;

export type GetGeneratedDocumentResponse = {
  document: GeneratedDocumentWithTemplateAndPatientDTO | null;
};

export type GetGeneratedDocumentPromise = Promise<SerializedResult<GetGeneratedDocumentResponse>>;

const _getGeneratedDocument = createAction<
  GetGeneratedDocumentRequest,
  GetGeneratedDocumentResponse
>({
  name: "documents.getGeneratedDocument",
  inputSchema: getGeneratedDocumentRequestSchema,
  handler: async (input, context) => {
    const result = await getGeneratedDocumentById(
      context.supabase,
      input.documentId,
      context.userId,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ document: result.value });
  },
});

export async function getGeneratedDocumentAction(
  input: GetGeneratedDocumentRequest,
): Promise<SerializedResult<GetGeneratedDocumentResponse>> {
  const result = await _getGeneratedDocument(input);
  return serializeResult(result);
}
