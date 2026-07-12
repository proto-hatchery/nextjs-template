"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { ClinicalNoteWithDetailsDTO } from "../../modules/notes/domain/dto/clinical-note.dto";
import { NoteSupabaseRepository } from "../../modules/notes/infrastructure/repositories/note-supabase.repository";

const getDetailedClinicalNoteRequestSchema = z
  .object({
    noteId: z.uuid(),
  })
  .strict();

export type GetDetailedClinicalNoteRequest = z.infer<typeof getDetailedClinicalNoteRequestSchema>;

export type GetDetailedClinicalNoteResponse = {
  note: ClinicalNoteWithDetailsDTO | null;
};

export type GetDetailedClinicalNotePromise = Promise<
  SerializedResult<GetDetailedClinicalNoteResponse>
>;

const _getDetailedClinicalNote = createAction<
  GetDetailedClinicalNoteRequest,
  GetDetailedClinicalNoteResponse
>({
  name: "notes.getDetailedClinicalNote",
  inputSchema: getDetailedClinicalNoteRequestSchema,
  handler: async (input, context) => {
    const result = await new NoteSupabaseRepository(context.supabase).findDetailedById(
      input.noteId,
      context.userId,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ note: result.value });
  },
});

export async function getDetailedClinicalNoteAction(
  input: GetDetailedClinicalNoteRequest,
): Promise<SerializedResult<GetDetailedClinicalNoteResponse>> {
  const result = await _getDetailedClinicalNote(input);
  return serializeResult(result);
}
