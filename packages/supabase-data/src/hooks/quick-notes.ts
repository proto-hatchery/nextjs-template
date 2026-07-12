"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";
import { QuickNoteSupabaseRepository } from "../modules/quick-notes/infrastructure/repositories/quick-note-supabase.repository";
import type { QuickNoteDTO } from "../modules/quick-notes/domain/dto/quick-note.dto";
import { queryKeys } from "../utils/query-keys";

async function getClientUserId(): Promise<string | null> {
  const supabase = createBrowserAuthClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export function useQuickNotes(): UseQueryResult<readonly QuickNoteDTO[], Error> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.quickNotes.list(),
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return [];
      const repository = new QuickNoteSupabaseRepository(supabase);
      const result = await repository.getNotes(userId);
      if (result.isErr()) throw new Error(result.error.message);
      return result.value;
    },
    staleTime: 5 * 60 * 1000,
  });
}
