"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { ClinicalNoteWithDetailsDTO } from "../../modules/notes/domain/dto/clinical-note.dto";
import { NoteSupabaseRepository } from "../../modules/notes/infrastructure/repositories/note-supabase.repository";

const listRecentClinicalNotesRequestSchema = z
  .object({
    limit: z.number().int().positive().max(100).optional().default(10),
  })
  .strict();

export type ListRecentClinicalNotesRequest = z.infer<typeof listRecentClinicalNotesRequestSchema>;

export type ListRecentClinicalNotesResponse = {
  notes: readonly ClinicalNoteWithDetailsDTO[];
};

export type ListRecentClinicalNotesPromise = Promise<
  SerializedResult<ListRecentClinicalNotesResponse>
>;

const _listRecentClinicalNotes = createAction<
  ListRecentClinicalNotesRequest,
  ListRecentClinicalNotesResponse
>({
  name: "notes.listRecentClinicalNotes",
  inputSchema: listRecentClinicalNotesRequestSchema,
  handler: async (input, context) => {
    const result = await new NoteSupabaseRepository(context.supabase).findRecentDetailed(
      context.userId,
      input.limit,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ notes: result.value });
  },
});

export async function listRecentClinicalNotesAction(
  input: ListRecentClinicalNotesRequest,
): Promise<SerializedResult<ListRecentClinicalNotesResponse>> {
  const result = await _listRecentClinicalNotes(input);
  return serializeResult(result);
}
