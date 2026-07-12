"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import type {
  ClinicalNoteType,
  ClinicalNoteWithDetailsDTO,
} from "../../modules/notes/domain/dto/clinical-note.dto";
import { NoteSupabaseRepository } from "../../modules/notes/infrastructure/repositories/note-supabase.repository";
import { verifyPatientOwnership } from "../../utils/authorization";

// All note types from domain DTO for backward compatibility
const noteTypeSchema = z.enum([
  "clinical_note",
  "progress_note",
  "hypothesis",
  "treatment_plan",
  "risk_assessment",
  "test_result",
]);

const listDetailedClinicalNotesRequestSchema = z
  .object({
    patientId: z.uuid().optional(),
    noteType: noteTypeSchema.optional(),
    isArchived: z.boolean().optional(),
    sessionId: z.uuid().optional(),
    search: z.string().optional(),
    limit: z.number().int().positive().max(100).optional(),
    offset: z.number().int().min(0).optional(),
  })
  .strict();

export type ListDetailedClinicalNotesRequest = z.infer<
  typeof listDetailedClinicalNotesRequestSchema
>;

export type ListDetailedClinicalNotesResponse = {
  notes: readonly ClinicalNoteWithDetailsDTO[];
};

export type ListDetailedClinicalNotesPromise = Promise<
  SerializedResult<ListDetailedClinicalNotesResponse>
>;

const _listDetailedClinicalNotes = createAction<
  ListDetailedClinicalNotesRequest,
  ListDetailedClinicalNotesResponse
>({
  name: "notes.listDetailedClinicalNotes",
  inputSchema: listDetailedClinicalNotesRequestSchema,
  handler: async (input, context) => {
    const { patientId, noteType, isArchived, sessionId, search, limit, offset } = input;
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

    const result = await new NoteSupabaseRepository(supabase).findDetailedByPatient(
      patientId ?? null,
      userId,
      {
        ...(noteType !== undefined ? { noteType: noteType as ClinicalNoteType } : {}),
        ...(isArchived !== undefined ? { isArchived } : {}),
        ...(sessionId !== undefined ? { sessionId } : {}),
        ...(search !== undefined ? { search } : {}),
        ...(limit !== undefined ? { limit } : {}),
        ...(offset !== undefined ? { offset } : {}),
      },
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ notes: result.value });
  },
});

export async function listDetailedClinicalNotesAction(
  input: ListDetailedClinicalNotesRequest = {},
): ListDetailedClinicalNotesPromise {
  const result = await _listDetailedClinicalNotes(input);
  return serializeResult(result);
}
