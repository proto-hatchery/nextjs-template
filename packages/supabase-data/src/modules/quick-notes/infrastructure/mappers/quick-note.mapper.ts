import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  CreateQuickNoteInput,
  QuickNoteDTO,
  QuickNotePriority,
  UpdateQuickNoteInput,
} from "../../domain/dto/quick-note.dto";

type QuickNoteRow = Database["public"]["Tables"]["psychologist_quick_notes"]["Row"];
type QuickNoteInsert = Database["public"]["Tables"]["psychologist_quick_notes"]["Insert"];
type QuickNoteUpdate = Database["public"]["Tables"]["psychologist_quick_notes"]["Update"];

export function toQuickNoteDTO(row: QuickNoteRow): QuickNoteDTO {
  return {
    id: row.id,
    psychologistId: row.psychologist_id,
    title: row.title,
    priority: (row.priority as QuickNotePriority | null) ?? "none",
    dueDate: row.due_date,
    isCompleted: row.is_completed ?? false,
    completedAt: row.completed_at,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

export function toDatabaseInsert(
  psychologistId: string,
  input: CreateQuickNoteInput,
): QuickNoteInsert {
  return {
    psychologist_id: psychologistId,
    title: input.title,
    priority: input.priority ?? "none",
    due_date: input.dueDate ?? null,
    is_completed: false,
    completed_at: null,
  };
}

export function toDatabaseUpdate(input: UpdateQuickNoteInput): QuickNoteUpdate {
  const update: QuickNoteUpdate = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) update.title = input.title;
  if (input.priority !== undefined) update.priority = input.priority;
  if (input.dueDate !== undefined) update.due_date = input.dueDate;

  return update;
}

export function toToggleUpdate(isCompleted: boolean): QuickNoteUpdate {
  return {
    is_completed: isCompleted,
    completed_at: isCompleted ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}
