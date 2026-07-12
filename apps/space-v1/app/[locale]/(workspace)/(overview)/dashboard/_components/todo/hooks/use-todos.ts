"use client";

import type { QuickNoteDTO, QuickNotePriority } from "@workspace/supabase-data/types/entities";
import {
  clearCompletedQuickNotesAction,
  createQuickNoteAction,
  deleteQuickNoteAction,
  toggleQuickNoteAction,
} from "@workspace/supabase-data/actions/quick-notes/manage-quick-notes";
import { useQuickNotes } from "@workspace/supabase-data/hooks/quick-notes";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import type { TodoItem, UseTodosReturn } from "../../../types/todo";

const DEFAULT_PRIORITY: QuickNotePriority = "none";

const formatDateForDb = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toLocalDateTimeISO = (dateString: string) => `${dateString}T00:00:00`;

const mapQuickNoteToTodo = (note: QuickNoteDTO): TodoItem => ({
  id: note.id,
  title: note.title,
  isCompleted: note.isCompleted,
  createdAtISO: note.createdAt,
  priority: note.priority ?? DEFAULT_PRIORITY,
  ...(note.dueDate ? { dueDateISO: toLocalDateTimeISO(note.dueDate) } : {}),
});

export function useTodos(): UseTodosReturn {
  const { data: notes, isPending, error } = useQuickNotes();
  const queryClient = useQueryClient();

  const invalidateQuickNotes = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.quickNotes.all });
  }, [queryClient]);

  const items = useMemo(() => {
    return (notes ?? []).map(mapQuickNoteToTodo);
  }, [notes]);

  const addItem = useCallback(
    (title: string, priority: TodoItem["priority"], dueDate?: Date) => {
      void (async () => {
        try {
          unwrapActionResult(
            await createQuickNoteAction({
              title,
              priority: priority ?? DEFAULT_PRIORITY,
              dueDate: dueDate ? formatDateForDb(dueDate) : null,
            }),
          );
          invalidateQuickNotes();
        } catch {
          toast.error("Algo deu errado. Tente novamente.");
        }
      })();
    },
    [invalidateQuickNotes],
  );

  const toggleItem = useCallback(
    (id: string, checked: boolean) => {
      void (async () => {
        try {
          unwrapActionResult(await toggleQuickNoteAction({ noteId: id, isCompleted: checked }));
          invalidateQuickNotes();
        } catch {
          toast.error("Algo deu errado. Tente novamente.");
        }
      })();
    },
    [invalidateQuickNotes],
  );

  const removeItem = useCallback(
    (id: string) => {
      void (async () => {
        try {
          unwrapActionResult(await deleteQuickNoteAction({ noteId: id }));
          invalidateQuickNotes();
        } catch {
          toast.error("Algo deu errado. Tente novamente.");
        }
      })();
    },
    [invalidateQuickNotes],
  );

  const clearAllCompleted = useCallback(() => {
    void (async () => {
      try {
        unwrapActionResult(await clearCompletedQuickNotesAction({}));
        invalidateQuickNotes();
      } catch {
        toast.error("Algo deu errado. Tente novamente.");
      }
    })();
  }, [invalidateQuickNotes]);

  return {
    items,
    addItem,
    toggleItem,
    removeItem,
    clearCompleted: clearAllCompleted,
    isHydrated: !isPending,
    error: error?.message ?? null,
  };
}
