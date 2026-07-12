"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { ClinicalNoteDTO } from "../../modules/notes/domain/dto/clinical-note.dto";
import { NoteSupabaseRepository } from "../../modules/notes/infrastructure/repositories/note-supabase.repository";

const getClinicalNoteRequestSchema = z
  .object({
    noteId: z.uuid(),
  })
  .strict();

export type GetClinicalNoteRequest = z.infer<typeof getClinicalNoteRequestSchema>;

export type GetClinicalNoteResponse = {
  note: ClinicalNoteDTO | null;
};

export type GetClinicalNotePromise = Promise<SerializedResult<GetClinicalNoteResponse>>;

const _getClinicalNote = createAction<GetClinicalNoteRequest, GetClinicalNoteResponse>({
  name: "notes.getClinicalNote",
  inputSchema: getClinicalNoteRequestSchema,
  handler: async (input, context) => {
    const result = await new NoteSupabaseRepository(context.supabase).findById(
      input.noteId,
      context.userId,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ note: result.value });
  },
});

export async function getClinicalNoteAction(
  input: GetClinicalNoteRequest,
): Promise<SerializedResult<GetClinicalNoteResponse>> {
  const result = await _getClinicalNote(input);
  return serializeResult(result);
}
