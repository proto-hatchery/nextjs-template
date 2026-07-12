/**
 * Quick notes domain DTOs.
 */

export type QuickNotePriority = "none" | "low" | "medium" | "high";

export interface QuickNoteDTO {
  readonly id: string;
  readonly psychologistId: string;
  readonly title: string;
  readonly priority: QuickNotePriority;
  readonly dueDate: string | null;
  readonly isCompleted: boolean;
  readonly completedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateQuickNoteInput {
  readonly title: string;
  readonly priority?: QuickNotePriority;
  readonly dueDate?: string | null;
}

export interface UpdateQuickNoteInput {
  readonly title?: string;
  readonly priority?: QuickNotePriority;
  readonly dueDate?: string | null;
}

export interface QuickNoteResult {
  readonly id: string;
}

export interface ClearCompletedResult {
  readonly count: number;
}

export interface GroupedQuickNotesDTO {
  readonly overdue: readonly QuickNoteDTO[];
  readonly today: readonly QuickNoteDTO[];
  readonly completed: readonly QuickNoteDTO[];
  readonly upcoming: readonly QuickNoteDTO[];
}

export const DEFAULT_QUICK_NOTE_PRIORITY: QuickNotePriority = "none";

export function isQuickNotePriority(value: string): value is QuickNotePriority {
  return value === "none" || value === "low" || value === "medium" || value === "high";
}

export function sortQuickNotes(notes: readonly QuickNoteDTO[]): QuickNoteDTO[] {
  return [...notes].sort((left, right) => {
    if (left.isCompleted !== right.isCompleted) {
      return left.isCompleted ? 1 : -1;
    }

    if (left.dueDate !== right.dueDate) {
      if (!left.dueDate) return 1;
      if (!right.dueDate) return -1;
      return left.dueDate.localeCompare(right.dueDate);
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function groupQuickNotes(notes: readonly QuickNoteDTO[]): GroupedQuickNotesDTO {
  const today = new Date().toISOString().slice(0, 10);

  const grouped: {
    overdue: QuickNoteDTO[];
    today: QuickNoteDTO[];
    completed: QuickNoteDTO[];
    upcoming: QuickNoteDTO[];
  } = {
    overdue: [],
    today: [],
    completed: [],
    upcoming: [],
  };

  for (const note of notes) {
    if (note.isCompleted) {
      grouped.completed.push(note);
      continue;
    }

    if (note.dueDate && note.dueDate < today) {
      grouped.overdue.push(note);
      continue;
    }

    if (note.dueDate === today) {
      grouped.today.push(note);
      continue;
    }

    grouped.upcoming.push(note);
  }

  return grouped;
}
