"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { NoteSupabaseRepository } from "../../modules/notes/infrastructure/repositories/note-supabase.repository";

const archiveClinicalNoteRequestSchema = z
  .object({
    noteId: z.uuid(),
  })
  .strict();

export type ArchiveClinicalNoteRequest = z.infer<typeof archiveClinicalNoteRequestSchema>;

export type ArchiveClinicalNoteResponse = {
  success: true;
};

export type ArchiveClinicalNotePromise = Promise<SerializedResult<ArchiveClinicalNoteResponse>>;

const _archiveClinicalNote = createAction<ArchiveClinicalNoteRequest, ArchiveClinicalNoteResponse>({
  name: "notes.archiveClinicalNote",
  inputSchema: archiveClinicalNoteRequestSchema,
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

    const result = await repository.archive(input.noteId, context.userId);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ success: true });
  },
});

export async function archiveClinicalNoteAction(
  input: ArchiveClinicalNoteRequest,
): Promise<SerializedResult<ArchiveClinicalNoteResponse>> {
  const result = await _archiveClinicalNote(input);
  return serializeResult(result);
}
