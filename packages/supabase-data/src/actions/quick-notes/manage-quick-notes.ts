"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { QuickNoteSupabaseRepository } from "../../modules/quick-notes/infrastructure/repositories/quick-note-supabase.repository";
import type {
  ClearCompletedResult,
  QuickNoteDTO,
  QuickNotePriority,
  QuickNoteResult,
} from "../../modules/quick-notes/domain/dto/quick-note.dto";

const quickNotePrioritySchema = z.enum(["none", "low", "medium", "high"]);

const createQuickNoteRequestSchema = z
  .object({
    title: z.string().trim().min(1),
    priority: quickNotePrioritySchema.optional(),
    dueDate: z.string().nullable().optional(),
  })
  .strict();

const toggleQuickNoteRequestSchema = z
  .object({
    noteId: z.uuid(),
    isCompleted: z.boolean(),
  })
  .strict();

const deleteQuickNoteRequestSchema = z
  .object({
    noteId: z.uuid(),
  })
  .strict();

const clearCompletedQuickNotesRequestSchema = z.object({}).strict();

export type CreateQuickNoteRequest = z.infer<typeof createQuickNoteRequestSchema>;
export type ToggleQuickNoteRequest = z.infer<typeof toggleQuickNoteRequestSchema>;
export type DeleteQuickNoteRequest = z.infer<typeof deleteQuickNoteRequestSchema>;
export type ClearCompletedQuickNotesRequest = z.infer<
  typeof clearCompletedQuickNotesRequestSchema
>;

export type QuickNoteResponse = { note: QuickNoteDTO };
export type DeleteQuickNoteResponse = QuickNoteResult;
export type ClearCompletedQuickNotesResponse = ClearCompletedResult;

const createQuickNote = createAction<CreateQuickNoteRequest, QuickNoteResponse>({
  name: "quickNotes.createQuickNote",
  inputSchema: createQuickNoteRequestSchema,
  handler: async (input, context) => {
    const repository = new QuickNoteSupabaseRepository(context.supabase);
    const result = await repository.createNote(context.userId, {
      title: input.title,
      priority: (input.priority ?? "none") as QuickNotePriority,
      dueDate: input.dueDate ?? null,
    });

    return result.isErr() ? err(result.error) : ok({ note: result.value });
  },
});

const toggleQuickNote = createAction<ToggleQuickNoteRequest, QuickNoteResponse>({
  name: "quickNotes.toggleQuickNote",
  inputSchema: toggleQuickNoteRequestSchema,
  handler: async (input, context) => {
    const repository = new QuickNoteSupabaseRepository(context.supabase);
    const result = await repository.toggleNoteCompletion(
      input.noteId,
      context.userId,
      input.isCompleted,
    );

    return result.isErr() ? err(result.error) : ok({ note: result.value });
  },
});

const deleteQuickNote = createAction<DeleteQuickNoteRequest, DeleteQuickNoteResponse>({
  name: "quickNotes.deleteQuickNote",
  inputSchema: deleteQuickNoteRequestSchema,
  handler: async (input, context) => {
    const repository = new QuickNoteSupabaseRepository(context.supabase);
    return repository.deleteNote(input.noteId, context.userId);
  },
});

const clearCompletedQuickNotes = createAction<
  ClearCompletedQuickNotesRequest,
  ClearCompletedQuickNotesResponse
>({
  name: "quickNotes.clearCompletedQuickNotes",
  inputSchema: clearCompletedQuickNotesRequestSchema,
  handler: async (_input, context) => {
    const repository = new QuickNoteSupabaseRepository(context.supabase);
    return repository.clearCompletedNotes(context.userId);
  },
});

export async function createQuickNoteAction(
  input: CreateQuickNoteRequest,
): Promise<SerializedResult<QuickNoteResponse>> {
  return serializeResult(await createQuickNote(input));
}

export async function toggleQuickNoteAction(
  input: ToggleQuickNoteRequest,
): Promise<SerializedResult<QuickNoteResponse>> {
  return serializeResult(await toggleQuickNote(input));
}

export async function deleteQuickNoteAction(
  input: DeleteQuickNoteRequest,
): Promise<SerializedResult<DeleteQuickNoteResponse>> {
  return serializeResult(await deleteQuickNote(input));
}

export async function clearCompletedQuickNotesAction(
  input: ClearCompletedQuickNotesRequest,
): Promise<SerializedResult<ClearCompletedQuickNotesResponse>> {
  return serializeResult(await clearCompletedQuickNotes(input));
}
