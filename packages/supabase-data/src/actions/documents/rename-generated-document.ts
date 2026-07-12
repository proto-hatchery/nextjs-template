"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { renameGeneratedDocument } from "../../modules/documents/application/document-commands";
import type { GeneratedDocumentDTO } from "../../modules/documents/domain/dto/generated-document.dto";

const renameGeneratedDocumentRequestSchema = z
  .object({
    documentId: z.uuid(),
    title: z.string().min(1),
  })
  .strict();

export type RenameGeneratedDocumentRequest = z.infer<typeof renameGeneratedDocumentRequestSchema>;

export type RenameGeneratedDocumentResponse = {
  document: GeneratedDocumentDTO;
};

export type RenameGeneratedDocumentPromise = Promise<
  SerializedResult<RenameGeneratedDocumentResponse>
>;

const _renameGeneratedDocument = createAction<
  RenameGeneratedDocumentRequest,
  RenameGeneratedDocumentResponse
>({
  name: "documents.renameGeneratedDocument",
  inputSchema: renameGeneratedDocumentRequestSchema,
  handler: async (input, context) => {
    const result = await renameGeneratedDocument(
      context.supabase,
      input.documentId,
      context.userId,
      input.title,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ document: result.value });
  },
});

export async function renameGeneratedDocumentAction(
  input: RenameGeneratedDocumentRequest,
): Promise<SerializedResult<RenameGeneratedDocumentResponse>> {
  const result = await _renameGeneratedDocument(input);
  return serializeResult(result);
}
