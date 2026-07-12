"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";
import { getClinicalNoteByTypeAction } from "../actions/notes/get-clinical-note-by-type";
import { getDetailedClinicalNoteAction } from "../actions/notes/get-detailed-clinical-note";
import { getSessionClinicalNoteAction } from "../actions/notes/get-session-clinical-note";
import { listDetailedClinicalNotesAction } from "../actions/notes/list-detailed-clinical-notes";
import { listRecentClinicalNotesAction } from "../actions/notes/list-recent-clinical-notes";
import { unwrapActionResult } from "../lib/boundary/unwrap-action";
import type { NoteFilters, NoteWithDetails } from "../types/entities";
import { queryKeys } from "../utils/query-keys";

const NotesResponseSchema = z.object({ notes: z.array(z.any()) });
const NoteResponseSchema = z.object({ note: z.any().nullable().optional() });

function toAppNote(note: any): NoteWithDetails {
  return {
    id: note.id,
    content: null,
    patient_id: note.patientId,
    psychologist_client_id: note.patientId,
    psychologist_id: note.psychologistId,
    note_type: note.noteType as NoteWithDetails["note_type"],
    encoded_content: note.encodedContent,
    title: note.title,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
    created_by: note.createdBy,
    is_archived: note.isArchived,
    session_id: note.sessionId,
    parent_note_id: note.parentNoteId,
    tags: note.tags ? [...note.tags] : null,
    patientName: note.patientName,
    sessionDate: note.sessionDate,
  };
}

export function useNotes(filters?: NoteFilters): UseQueryResult<NoteWithDetails[], Error> {
  return useQuery({
    queryKey: queryKeys.notes.list(filters),
    queryFn: async () => {
      const data = unwrapActionResult(
        await listDetailedClinicalNotesAction({
          patientId: filters?.patientId,
          ...(filters?.noteType ? { noteType: filters.noteType } : {}),
          sessionId: filters?.sessionId,
          isArchived: filters?.isArchived,
          search: filters?.search,
          limit: filters?.limit,
          offset: filters?.offset,
        }),
        NotesResponseSchema,
      );
      return data.notes.map(toAppNote);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useNote(noteId: string | undefined): UseQueryResult<NoteWithDetails | null, Error> {
  return useQuery({
    queryKey: queryKeys.notes.detail(noteId ?? ""),
    queryFn: async () => {
      if (!noteId) return null;
      const data = unwrapActionResult(
        await getDetailedClinicalNoteAction({ noteId }),
        NoteResponseSchema,
      );
      return data.note ? toAppNote(data.note) : null;
    },
    enabled: !!noteId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePatientNotes(
  patientId: string | undefined,
): UseQueryResult<NoteWithDetails[], Error> {
  return useNotes(patientId ? { patientId } : undefined);
}

export function useClinicalNotesByPatient(
  patientId: string | undefined,
): UseQueryResult<NoteWithDetails[], Error> {
  return useQuery({
    queryKey: queryKeys.notes.clinical(patientId ?? ""),
    queryFn: async () => {
      if (!patientId) return [];
      const data = unwrapActionResult(
        await listDetailedClinicalNotesAction({ patientId, noteType: "clinical_note" }),
        NotesResponseSchema,
      );
      return data.notes.map(toAppNote);
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProgressNotesByPatient(
  patientId: string | undefined,
): UseQueryResult<NoteWithDetails[], Error> {
  return useQuery({
    queryKey: queryKeys.notes.progress(patientId ?? ""),
    queryFn: async () => {
      if (!patientId) return [];
      const data = unwrapActionResult(
        await listDetailedClinicalNotesAction({ patientId, noteType: "progress_note" }),
        NotesResponseSchema,
      );
      return data.notes.map(toAppNote);
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSessionNote(
  sessionId: string | undefined,
): UseQueryResult<NoteWithDetails | null, Error> {
  return useQuery({
    queryKey: queryKeys.notes.bySession(sessionId ?? ""),
    queryFn: async () => {
      if (!sessionId) return null;
      const data = unwrapActionResult(
        await getSessionClinicalNoteAction({ sessionId }),
        NoteResponseSchema,
      );
      return data.note ? toAppNote(data.note) : null;
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentNotes(limit = 10): UseQueryResult<NoteWithDetails[], Error> {
  return useQuery({
    queryKey: queryKeys.notes.recent(limit),
    queryFn: async () => {
      const data = unwrapActionResult(
        await listRecentClinicalNotesAction({ limit }),
        NotesResponseSchema,
      );
      return data.notes.map(toAppNote);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useNoteByType(
  patientId: string | undefined,
  noteType: NoteWithDetails["note_type"] | undefined,
): UseQueryResult<NoteWithDetails | null, Error> {
  return useQuery({
    queryKey: queryKeys.notes.byType(patientId ?? "", noteType ?? ""),
    queryFn: async () => {
      if (!patientId || !noteType) return null;
      const data = unwrapActionResult(
        await getClinicalNoteByTypeAction({ patientId, noteType }),
        NoteResponseSchema,
      );
      return data.note ? toAppNote(data.note) : null;
    },
    enabled: !!patientId && !!noteType,
    staleTime: 5 * 60 * 1000,
  });
}
