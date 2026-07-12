"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { NoteSupabaseRepository } from "../../modules/notes/infrastructure/repositories/note-supabase.repository";

const unarchiveClinicalNoteRequestSchema = z
  .object({
    noteId: z.uuid(),
  })
  .strict();

export type UnarchiveClinicalNoteRequest = z.infer<typeof unarchiveClinicalNoteRequestSchema>;

export type UnarchiveClinicalNoteResponse = {
  success: true;
};

export type UnarchiveClinicalNotePromise = Promise<SerializedResult<UnarchiveClinicalNoteResponse>>;

const _unarchiveClinicalNote = createAction<
  UnarchiveClinicalNoteRequest,
  UnarchiveClinicalNoteResponse
>({
  name: "notes.unarchiveClinicalNote",
  inputSchema: unarchiveClinicalNoteRequestSchema,
  handler: async (input, context) => {
    const repository = new NoteSupabaseRepository(context.supabase);
    const existsResult = await repository.exists(input.noteId, context.userId);

    if (existsResult.isErr()) {
      return err(existsResult.error);
    }

    if (!existsResult.value) {
      return err(
        AppError.notFound(
          AppErrorCode.NOT_FOUND_ENTITY,
          "Clinical note not found",
          "clinical_note",
          input.noteId,
        ),
      );
    }

    const result = await repository.unarchive(input.noteId, context.userId);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ success: true });
  },
});

export async function unarchiveClinicalNoteAction(
  input: UnarchiveClinicalNoteRequest,
): Promise<SerializedResult<UnarchiveClinicalNoteResponse>> {
  const result = await _unarchiveClinicalNote(input);
  return serializeResult(result);
}
