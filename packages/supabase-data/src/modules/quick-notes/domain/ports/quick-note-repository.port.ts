import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type {
  ClearCompletedResult,
  CreateQuickNoteInput,
  QuickNoteDTO,
  QuickNoteResult,
  UpdateQuickNoteInput,
} from "../dto/quick-note.dto";

export interface QuickNoteRepository {
  getNotes(psychologistId: string): Promise<Result<readonly QuickNoteDTO[], AppError>>;
  getNoteById(
    noteId: string,
    psychologistId: string,
  ): Promise<Result<QuickNoteDTO | null, AppError>>;
  createNote(
    psychologistId: string,
    input: CreateQuickNoteInput,
  ): Promise<Result<QuickNoteDTO, AppError>>;
  updateNote(
    noteId: string,
    psychologistId: string,
    input: UpdateQuickNoteInput,
  ): Promise<Result<QuickNoteDTO, AppError>>;
  deleteNote(noteId: string, psychologistId: string): Promise<Result<QuickNoteResult, AppError>>;
  toggleNoteCompletion(
    noteId: string,
    psychologistId: string,
    isCompleted: boolean,
  ): Promise<Result<QuickNoteDTO, AppError>>;
  clearCompletedNotes(psychologistId: string): Promise<Result<ClearCompletedResult, AppError>>;
}
