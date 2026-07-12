"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import type {
  ClinicalNoteSummaryDTO,
  ClinicalNoteType,
} from "../../modules/notes/domain/dto/clinical-note.dto";
import { NoteSupabaseRepository } from "../../modules/notes/infrastructure/repositories/note-supabase.repository";
import { verifyPatientOwnership } from "../../utils/authorization";

const noteTypeSchema = z.enum(["clinical_note", "progress_note"]);

const listClinicalNotesRequestSchema = z
  .object({
    patientId: z.uuid().optional(),
    noteType: noteTypeSchema.optional(),
    isArchived: z.boolean().optional(),
    limit: z.number().int().positive().max(100).optional(),
    offset: z.number().int().min(0).optional(),
  })
  .strict();

export type ListClinicalNotesRequest = z.infer<typeof listClinicalNotesRequestSchema>;

export type ListClinicalNotesResponse = {
  notes: readonly ClinicalNoteSummaryDTO[];
  totalCount: number;
  hasMore: boolean;
};

export type ListClinicalNotesPromise = Promise<SerializedResult<ListClinicalNotesResponse>>;

const _listClinicalNotes = createAction<ListClinicalNotesRequest, ListClinicalNotesResponse>({
  name: "notes.listClinicalNotes",
  inputSchema: listClinicalNotesRequestSchema,
  handler: async (input, context) => {
    const { patientId, noteType, isArchived, limit, offset } = input;
    const { userId, supabase } = context;

    if (patientId) {
      const isOwner = await verifyPatientOwnership(supabase, userId, patientId);
      if (!isOwner) {
        return err(
          AppError.auth(
            AppErrorCode.AUTH_FORBIDDEN,
            "You do not have permission to access this patient",
          ),
        );
      }
    }

    const result = await new NoteSupabaseRepository(supabase).findByPatient(
      patientId ?? null,
      userId,
      {
        ...(noteType !== undefined ? { noteType: noteType as ClinicalNoteType } : {}),
        ...(isArchived !== undefined ? { isArchived } : {}),
        ...(limit !== undefined ? { limit } : {}),
        ...(offset !== undefined ? { offset } : {}),
      },
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function listClinicalNotesAction(
  input: ListClinicalNotesRequest,
): Promise<SerializedResult<ListClinicalNotesResponse>> {
  const result = await _listClinicalNotes(input);
  return serializeResult(result);
}
