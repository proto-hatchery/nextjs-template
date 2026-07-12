"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { verifyPatientOwnership } from "../../utils/authorization";
import type { ClinicalNoteDTO } from "../../modules/notes/domain/dto/clinical-note.dto";
import { NoteSupabaseRepository } from "../../modules/notes/infrastructure/repositories/note-supabase.repository";

/**
 * Request DTO for getting note by type
 */
const getNoteByTypeRequestSchema = z.object({
  patientId: z.uuid(),
  noteType: z.string(),
});

export type GetNoteByTypeRequest = z.infer<typeof getNoteByTypeRequestSchema>;

/**
 * Response DTO for getting note by type
 */
export type GetNoteByTypeResponse = {
  note: ClinicalNoteDTO | null;
};

/**
 * Promise type for getting note by type
 */
export type GetNoteByTypePromise = Promise<SerializedResult<GetNoteByTypeResponse>>;

/**
 * Get the most recent clinical note of a specific type for a patient
 *
 * Returns null if no note of the specified type exists.
 *
 * @example
 * ```typescript
 * const result = await getNoteByType({
 *   patientId: "123",
 *   noteType: "clinical_note",
 * });
 *
 * if (result.isOk()) {
 *   const { note } = result.value;
 *   if (note) {
 *     console.log("Note content:", note.encodedContent);
 *   }
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
const _getNoteByType = createAction<GetNoteByTypeRequest, GetNoteByTypeResponse>({
  name: "getNoteByType",
  inputSchema: getNoteByTypeRequestSchema,
  handler: async (input, context) => {
    const { patientId, noteType } = input;
    const { userId, supabase } = context;

    // 1. Verify patient ownership
    const isOwner = await verifyPatientOwnership(supabase, userId, patientId);
    if (!isOwner) {
      return err(
        AppError.auth(
          AppErrorCode.AUTH_FORBIDDEN,
          "You do not have permission to access this patient",
        ),
      );
    }

    // 2. Fetch most recent note of specified type via repository
    const repository = new NoteSupabaseRepository(supabase);
    const result = await repository.findByPatientAndType(
      patientId,
      userId,
      noteType as ClinicalNoteDTO["noteType"] & string,
    );

    // 3. Handle repository result
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ note: result.value });
  },
});

export async function getNoteByTypeAction(
  input: GetNoteByTypeRequest,
): Promise<SerializedResult<GetNoteByTypeResponse>> {
  const result = await _getNoteByType(input);
  return serializeResult(result);
}
