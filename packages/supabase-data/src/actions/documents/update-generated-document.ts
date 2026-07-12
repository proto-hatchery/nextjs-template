"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { updateGeneratedDocument } from "../../modules/documents/application/document-commands";
import type { GeneratedDocumentDTO } from "../../modules/documents/domain/dto/generated-document.dto";

const updateGeneratedDocumentRequestSchema = z
  .object({
    documentId: z.uuid(),
    encodedContent: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
  })
  .strict()
  .refine((value) => value.encodedContent !== undefined || value.title !== undefined, {
    message: "At least one field must be provided",
  });

export type UpdateGeneratedDocumentRequest = z.infer<typeof updateGeneratedDocumentRequestSchema>;

export type UpdateGeneratedDocumentResponse = {
  document: GeneratedDocumentDTO;
};

export type UpdateGeneratedDocumentPromise = Promise<
  SerializedResult<UpdateGeneratedDocumentResponse>
>;

const _updateGeneratedDocument = createAction<
  UpdateGeneratedDocumentRequest,
  UpdateGeneratedDocumentResponse
>({
  name: "documents.updateGeneratedDocument",
  inputSchema: updateGeneratedDocumentRequestSchema,
  handler: async (input, context) => {
    const result = await updateGeneratedDocument(
      context.supabase,
      input.documentId,
      context.userId,
      {
        ...(input.encodedContent !== undefined ? { encodedContent: input.encodedContent } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
      },
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ document: result.value });
  },
});

export async function updateGeneratedDocumentAction(
  input: UpdateGeneratedDocumentRequest,
): Promise<SerializedResult<UpdateGeneratedDocumentResponse>> {
  const result = await _updateGeneratedDocument(input);
  return serializeResult(result);
}
