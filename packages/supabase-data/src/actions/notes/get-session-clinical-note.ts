"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { ClinicalNoteWithDetailsDTO } from "../../modules/notes/domain/dto/clinical-note.dto";
import { NoteSupabaseRepository } from "../../modules/notes/infrastructure/repositories/note-supabase.repository";

const getSessionClinicalNoteRequestSchema = z
  .object({
    sessionId: z.uuid(),
  })
  .strict();

export type GetSessionClinicalNoteRequest = z.infer<typeof getSessionClinicalNoteRequestSchema>;

export type GetSessionClinicalNoteResponse = {
  note: ClinicalNoteWithDetailsDTO | null;
};

export type GetSessionClinicalNotePromise = Promise<
  SerializedResult<GetSessionClinicalNoteResponse>
>;

const _getSessionClinicalNote = createAction<
  GetSessionClinicalNoteRequest,
  GetSessionClinicalNoteResponse
>({
  name: "notes.getSessionClinicalNote",
  inputSchema: getSessionClinicalNoteRequestSchema,
  handler: async (input, context) => {
    const result = await new NoteSupabaseRepository(context.supabase).findDetailedBySession(
      input.sessionId,
      context.userId,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ note: result.value });
  },
});

export async function getSessionClinicalNoteAction(
  input: GetSessionClinicalNoteRequest,
): Promise<SerializedResult<GetSessionClinicalNoteResponse>> {
  const result = await _getSessionClinicalNote(input);
  return serializeResult(result);
}
