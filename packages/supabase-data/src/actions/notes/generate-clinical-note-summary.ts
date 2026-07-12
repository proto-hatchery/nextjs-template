"use server";

import type { SerializedEditor } from "@workspace/lexical-editor/types";
import {
  decodeNote,
  encodeNote,
  extractTextFromEditorState,
} from "@workspace/lexical-editor/utils/encoding";
import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { NoteSupabaseRepository } from "../../modules/notes/infrastructure/repositories/note-supabase.repository";

// ─── Contracts ───────────────────────────────────────────────────────────────

const generateClinicalNoteSummaryRequestSchema = z.object({
  sourceNoteId: z.uuid(),
});

export type GenerateClinicalNoteSummaryRequest = z.infer<
  typeof generateClinicalNoteSummaryRequestSchema
>;

export type GenerateClinicalNoteSummaryResponse = {
  noteId: string;
};

export type GenerateClinicalNoteSummaryPromise = Promise<
  SerializedResult<GenerateClinicalNoteSummaryResponse>
>;

// ─── AI Summary Generator ─────────────────────────────────────────────────────

interface GenerateSummaryInput {
  content: string;
  metadata?: {
    sourceNoteId?: string;
    patientId?: string;
    sessionId?: string;
  };
}

interface GenerateSummaryOutput {
  summary: string;
}

async function generateClinicalNoteSummary(
  supabase: any,
  input: GenerateSummaryInput,
): Promise<GenerateSummaryOutput> {
  const { content, metadata } = input;

  const { data, error } = await supabase.functions.invoke("ai-generate-evolution", {
    body: {
      content,
      metadata,
    },
  });

  if (error) {
    throw new Error(`AI evolution generation failed: ${error.message}`);
  }

  if (!data?.summary) {
    throw new Error("AI evolution generation returned empty response");
  }

  return { summary: data.summary };
}

// ─── Action ──────────────────────────────────────────────────────────────────

const _generateClinicalNoteSummaryAction = createAction<
  GenerateClinicalNoteSummaryRequest,
  GenerateClinicalNoteSummaryResponse
>({
  name: "generateClinicalNoteSummary",
  inputSchema: generateClinicalNoteSummaryRequestSchema,
  handler: async (input, context) => {
    const { sourceNoteId } = input;
    const { userId, supabase } = context;

    const repository = new NoteSupabaseRepository(supabase);

    // 1. Fetch source note
    const sourceNoteResult = await repository.findById(sourceNoteId, userId);

    if (sourceNoteResult.isErr()) {
      return err(sourceNoteResult.error);
    }

    const sourceNote = sourceNoteResult.value;

    if (!sourceNote) {
      return err(
        AppError.notFound(AppErrorCode.NOT_FOUND_ENTITY, "Nota de origem não encontrada."),
      );
    }

    // 2. Verify ownership via patient (Repository already checks psychologist_id)

    // 3. Extract plain text from Lexical editor state
    const decodedContent = decodeNote(sourceNote.encodedContent);
    const plainText = extractTextFromEditorState(decodedContent);

    if (!plainText || plainText.trim().length === 0) {
      return err(
        AppError.validation(AppErrorCode.VALIDATION_INVALID_INPUT, "A nota de origem está vazia."),
      );
    }

    // 4. Generate summary via AI
    const { summary } = await generateClinicalNoteSummary(context.supabase, {
      content: plainText,
      metadata: {
        sourceNoteId: sourceNoteId,
        ...(sourceNote.patientId && { patientId: sourceNote.patientId }),
        ...(sourceNote.sessionId && { sessionId: sourceNote.sessionId }),
      },
    });

    // 5. Build Lexical state for the generated summary
    const encodedSummaryState = {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: summary,
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
            textFormat: 0,
            textStyle: "",
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    } as unknown as SerializedEditor;

    const encodedSummary = encodeNote(encodedSummaryState);

    // 6. Create progress note and link it to the source note
    const createResult = await repository.create(userId, {
      psychologistId: userId,
      patientId: sourceNote.patientId ?? "",
      noteType: "progress_note",
      encodedContent: encodedSummary,
      title: `Evolução - ${sourceNote.title ?? "Sessão"}`,
      createdBy: userId,
      isArchived: false,
      sessionId: sourceNote.sessionId ?? null,
      parentNoteId: null,
      tags: null,
    });

    if (createResult.isErr()) {
      return err(createResult.error);
    }

    const newNoteId = createResult.value.id;

    // 7. Link the new evolution note back to the source note using parent_note_id
    const linkResult = await repository.linkEvolutionNote(sourceNoteId, newNoteId);

    if (linkResult.isErr()) {
      return err(linkResult.error);
    }

    return ok({ noteId: newNoteId });
  },
});

export async function generateClinicalNoteSummaryAction(
  input: GenerateClinicalNoteSummaryRequest,
): Promise<SerializedResult<GenerateClinicalNoteSummaryResponse>> {
  const result = await _generateClinicalNoteSummaryAction(input);
  return serializeResult(result);
}
