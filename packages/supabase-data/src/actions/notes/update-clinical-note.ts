"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import type {
  ClinicalNoteDTO,
  ClinicalNoteType,
} from "../../modules/notes/domain/dto/clinical-note.dto";
import { NoteSupabaseRepository } from "../../modules/notes/infrastructure/repositories/note-supabase.repository";

const noteTypeSchema = z.enum(["clinical_note", "progress_note"]);

const updateClinicalNoteRequestSchema = z
  .object({
    noteId: z.uuid(),
    data: z
      .object({
        title: z.string().min(1).nullable().optional(),
        noteType: noteTypeSchema.optional(),
        encodedContent: z.string().min(1).optional(),
        tags: z.array(z.string()).nullable().optional(),
      })
      .strict()
      .refine(
        (value) =>
          value.title !== undefined ||
          value.noteType !== undefined ||
          value.encodedContent !== undefined ||
          value.tags !== undefined,
        { message: "At least one field must be provided" },
      ),
  })
  .strict();

export type UpdateClinicalNoteRequest = z.infer<typeof updateClinicalNoteRequestSchema>;

export type UpdateClinicalNoteResponse = {
  note: ClinicalNoteDTO;
};

export type UpdateClinicalNotePromise = Promise<SerializedResult<UpdateClinicalNoteResponse>>;

const _updateClinicalNote = createAction<UpdateClinicalNoteRequest, UpdateClinicalNoteResponse>({
  name: "notes.updateClinicalNote",
  inputSchema: updateClinicalNoteRequestSchema,
  handler: async (input, context) => {
    const { noteId, data } = input;
    const { userId, supabase } = context;
    const repository = new NoteSupabaseRepository(supabase);

    const existsResult = await repository.exists(noteId, userId);
    if (existsResult.isErr()) {
      return err(existsResult.error);
    }

    if (!existsResult.value) {
      return err(
        AppError.notFound(
          AppErrorCode.NOT_FOUND_ENTITY,
          "Clinical note not found",
          "clinical_note",
          noteId,
        ),
      );
    }

    const result = await repository.update(noteId, userId, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.noteType !== undefined ? { noteType: data.noteType as ClinicalNoteType } : {}),
      ...(data.encodedContent !== undefined ? { encodedContent: data.encodedContent } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
    });

    if (result.isErr()) {
      return err(result.error);
    }

    const note = result.value;
    return ok({ note });
  },
});

export async function updateClinicalNoteAction(
  input: UpdateClinicalNoteRequest,
): Promise<SerializedResult<UpdateClinicalNoteResponse>> {
  const result = await _updateClinicalNote(input);
  return serializeResult(result);
}
