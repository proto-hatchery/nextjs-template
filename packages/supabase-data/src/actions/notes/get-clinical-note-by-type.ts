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

const getClinicalNoteByTypeRequestSchema = z
  .object({
    patientId: z.uuid(),
    noteType: noteTypeSchema,
  })
  .strict();

export type GetClinicalNoteByTypeRequest = z.infer<typeof getClinicalNoteByTypeRequestSchema>;

export type GetClinicalNoteByTypeResponse = {
  note: ClinicalNoteWithDetailsDTO | null;
};

export type GetClinicalNoteByTypePromise = Promise<SerializedResult<GetClinicalNoteByTypeResponse>>;

const _getClinicalNoteByType = createAction<
  GetClinicalNoteByTypeRequest,
  GetClinicalNoteByTypeResponse
>({
  name: "notes.getClinicalNoteByType",
  inputSchema: getClinicalNoteByTypeRequestSchema,
  handler: async (input, context) => {
    const { patientId, noteType } = input;
    const { userId, supabase } = context;

    const isOwner = await verifyPatientOwnership(supabase, userId, patientId);
    if (!isOwner) {
      return err(
        AppError.auth(
          AppErrorCode.AUTH_FORBIDDEN,
          "You do not have permission to access this patient",
        ),
      );
    }

    const result = await new NoteSupabaseRepository(supabase).findDetailedByPatientAndType(
      patientId,
      userId,
      noteType as ClinicalNoteType,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ note: result.value });
  },
});

export async function getClinicalNoteByTypeAction(
  input: GetClinicalNoteByTypeRequest,
): GetClinicalNoteByTypePromise {
  const result = await _getClinicalNoteByType(input);
  return serializeResult(result);
}
