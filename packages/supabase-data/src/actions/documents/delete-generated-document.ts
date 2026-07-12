"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { deleteGeneratedDocument } from "../../modules/documents/application/document-commands";

const deleteGeneratedDocumentRequestSchema = z
  .object({
    documentId: z.uuid(),
  })
  .strict();

export type DeleteGeneratedDocumentRequest = z.infer<typeof deleteGeneratedDocumentRequestSchema>;

export type DeleteGeneratedDocumentResponse = {
  success: true;
};

export type DeleteGeneratedDocumentPromise = Promise<
  SerializedResult<DeleteGeneratedDocumentResponse>
>;

const _deleteGeneratedDocument = createAction<
  DeleteGeneratedDocumentRequest,
  DeleteGeneratedDocumentResponse
>({
  name: "documents.deleteGeneratedDocument",
  inputSchema: deleteGeneratedDocumentRequestSchema,
  handler: async (input, context) => {
    const result = await deleteGeneratedDocument(
      context.supabase,
      input.documentId,
      context.userId,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ success: true });
  },
});

export async function deleteGeneratedDocumentAction(
  input: DeleteGeneratedDocumentRequest,
): Promise<SerializedResult<DeleteGeneratedDocumentResponse>> {
  const result = await _deleteGeneratedDocument(input);
  return serializeResult(result);
}
