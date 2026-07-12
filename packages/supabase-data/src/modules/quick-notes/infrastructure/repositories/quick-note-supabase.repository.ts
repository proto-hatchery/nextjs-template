import { err, ok, type Result } from "neverthrow";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import { AppErrorCode, type AppError } from "../../../../lib/errors/app-error";
import type { QuickNoteRepository } from "../../domain/ports/quick-note-repository.port";
import type {
  ClearCompletedResult,
  CreateQuickNoteInput,
  QuickNoteDTO,
  QuickNoteResult,
  UpdateQuickNoteInput,
} from "../../domain/dto/quick-note.dto";
import {
  toDatabaseInsert,
  toDatabaseUpdate,
  toQuickNoteDTO,
  toToggleUpdate,
} from "../mappers/quick-note.mapper";

export class QuickNoteSupabaseRepository implements QuickNoteRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getNotes(psychologistId: string): Promise<Result<readonly QuickNoteDTO[], AppError>> {
    const { data, error } = await this.supabase
      .from("psychologist_quick_notes")
      .select("*")
      .eq("psychologist_id", psychologistId)
      .order("is_completed", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      return err({
        type: "Infra",
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to fetch quick notes",
        context: { originalError: error.message },
      });
    }

    return ok((data ?? []).map(toQuickNoteDTO));
  }

  async getNoteById(
    noteId: string,
    psychologistId: string,
  ): Promise<Result<QuickNoteDTO | null, AppError>> {
    const { data, error } = await this.supabase
      .from("psychologist_quick_notes")
      .select("*")
      .eq("id", noteId)
      .eq("psychologist_id", psychologistId)
      .maybeSingle();

    if (error) {
      return err({
        type: "Infra",
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to fetch quick note",
        context: { originalError: error.message },
      });
    }

    return ok(data ? toQuickNoteDTO(data) : null);
  }

  async createNote(
    psychologistId: string,
    input: CreateQuickNoteInput,
  ): Promise<Result<QuickNoteDTO, AppError>> {
    const { data, error } = await this.supabase
      .from("psychologist_quick_notes")
      .insert(toDatabaseInsert(psychologistId, input))
      .select("*")
      .single();

    if (error) {
      return err({
        type: "Infra",
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to create quick note",
        context: { originalError: error.message },
      });
    }

    return ok(toQuickNoteDTO(data));
  }

  async updateNote(
    noteId: string,
    psychologistId: string,
    input: UpdateQuickNoteInput,
  ): Promise<Result<QuickNoteDTO, AppError>> {
    const { data, error } = await this.supabase
      .from("psychologist_quick_notes")
      .update(toDatabaseUpdate(input))
      .eq("id", noteId)
      .eq("psychologist_id", psychologistId)
      .select("*")
      .single();

    if (error) {
      return err({
        type: "Infra",
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to update quick note",
        context: { originalError: error.message },
      });
    }

    return ok(toQuickNoteDTO(data));
  }

  async deleteNote(
    noteId: string,
    psychologistId: string,
  ): Promise<Result<QuickNoteResult, AppError>> {
    const { error } = await this.supabase
      .from("psychologist_quick_notes")
      .delete()
      .eq("id", noteId)
      .eq("psychologist_id", psychologistId);

    if (error) {
      return err({
        type: "Infra",
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to delete quick note",
        context: { originalError: error.message },
      });
    }

    return ok({ id: noteId });
  }

  async toggleNoteCompletion(
    noteId: string,
    psychologistId: string,
    isCompleted: boolean,
  ): Promise<Result<QuickNoteDTO, AppError>> {
    const { data, error } = await this.supabase
      .from("psychologist_quick_notes")
      .update(toToggleUpdate(isCompleted))
      .eq("id", noteId)
      .eq("psychologist_id", psychologistId)
      .select("*")
      .single();

    if (error) {
      return err({
        type: "Infra",
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to toggle quick note completion",
        context: { originalError: error.message },
      });
    }

    return ok(toQuickNoteDTO(data));
  }

  async clearCompletedNotes(
    psychologistId: string,
  ): Promise<Result<ClearCompletedResult, AppError>> {
    const { data, error } = await this.supabase
      .from("psychologist_quick_notes")
      .delete()
      .eq("psychologist_id", psychologistId)
      .eq("is_completed", true)
      .select("id");

    if (error) {
      return err({
        type: "Infra",
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to clear completed quick notes",
        context: { originalError: error.message },
      });
    }

    return ok({ count: data?.length ?? 0 });
  }
}
