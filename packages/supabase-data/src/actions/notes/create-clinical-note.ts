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
import { verifyPatientOwnership } from "../../utils/authorization";

const noteTypeSchema = z.enum(["clinical_note", "progress_note"]);

const createClinicalNoteRequestSchema = z
  .object({
    patientId: z.uuid().optional(),
    sessionId: z.uuid().optional(),
    title: z.string().min(1).optional(),
    noteType: noteTypeSchema.optional(),
    encodedContent: z.string().min(1),
    tags: z.array(z.string()).optional(),
  })
  .strict();

export type CreateClinicalNoteRequest = z.infer<typeof createClinicalNoteRequestSchema>;

export type CreateClinicalNoteResponse = {
  note: ClinicalNoteDTO;
};

export type CreateClinicalNotePromise = Promise<SerializedResult<CreateClinicalNoteResponse>>;

const _createClinicalNote = createAction<CreateClinicalNoteRequest, CreateClinicalNoteResponse>({
  name: "notes.createClinicalNote",
  inputSchema: createClinicalNoteRequestSchema,
  handler: async (input, context) => {
    const { patientId, sessionId, title, noteType, encodedContent, tags } = input;
    const { userId, supabase } = context;
    const repository = new NoteSupabaseRepository(supabase);

    let resolvedPatientId = patientId;

    if (sessionId) {
      const { data: session, error: sessionError } = await supabase
        .from("therapeutic_session_events")
        .select("calendar_event_id, clinical_session_id, psychologist_patient_id")
        .or(`calendar_event_id.eq.${sessionId},clinical_session_id.eq.${sessionId}`)
        .eq("psychologist_id", userId)
        .maybeSingle();

      if (sessionError) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to validate session", sessionError),
        );
      }

      if (!session) {
        return err(
          AppError.notFound(
            AppErrorCode.NOT_FOUND_RESOURCE,
            "Session not found",
            "clinical_session",
            sessionId,
          ),
        );
      }

      if (
        resolvedPatientId &&
        session.psychologist_patient_id &&
        resolvedPatientId !== session.psychologist_patient_id
      ) {
        return err(
          AppError.validation(
            AppErrorCode.VALIDATION_INVALID_INPUT,
            "Session does not belong to provided patient",
          ),
        );
      }

      resolvedPatientId = resolvedPatientId ?? session.psychologist_patient_id ?? undefined;
    }

    if (!resolvedPatientId) {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_MISSING_FIELD,
          "patientId is required when session has no linked patient",
        ),
      );
    }

    const isOwner = await verifyPatientOwnership(supabase, userId, resolvedPatientId);
    if (!isOwner) {
      return err(
        AppError.auth(
          AppErrorCode.AUTH_FORBIDDEN,
          "You do not have permission to access this patient",
        ),
      );
    }

    const result = await repository.create(userId, {
      psychologistId: userId,
      patientId: resolvedPatientId,
      noteType: (noteType ?? "clinical_note") as ClinicalNoteType,
      encodedContent,
      title: title ?? null,
      createdBy: userId,
      isArchived: false,
      sessionId: sessionId ?? null,
      parentNoteId: null,
      tags: tags ?? null,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    const note = result.value;
    return ok({ note });
  },
});

export async function createClinicalNoteAction(
  input: CreateClinicalNoteRequest,
): Promise<SerializedResult<CreateClinicalNoteResponse>> {
  const result = await _createClinicalNote(input);
  return serializeResult(result);
}
