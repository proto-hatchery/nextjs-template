/**
 * Robust auto-save hook for clinical notes.
 *
 * Implements a local-first persistence strategy with:
 * - Throttled local saves to IndexedDB (750ms)
 * - Debounced remote sync (3000ms)
 * - Lifecycle event handling (visibilitychange, pagehide, beforeunload)
 * - Conflict detection and recovery
 *
 * @see ADR-015 for architecture decisions
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SerializedEditorState, SerializedElementNode } from "@workspace/lexical-editor/types";
import { sanitizeSerializedEditorState } from "@workspace/lexical-editor/utils/encoding";
import {
  draftsDb,
  removeDraftMeta,
  writeDraftMeta,
  type NoteDraftEnvelope,
} from "./note-drafts-db";
import { debounce, isConflictError, stableHash, throttle } from "./autosave-utils";

type SerializedEditor = SerializedEditorState<SerializedElementNode>;

/** Timing constants per ADR-015 */
const LOCAL_THROTTLE_MS = 750;
const REMOTE_DEBOUNCE_MS = 3000;
const MAX_RETRIES = 3;

export type SyncState = NoteDraftEnvelope["syncState"];

export interface UseRobustNoteAutosaveParams {
  noteId: string;
  initialContent?: SerializedEditor | undefined;
  initialTitle?: string | undefined;
  serverVersion?: number | null | undefined;
  onSave: (payload: SavePayload) => Promise<SaveResult>;
}

export interface SavePayload {
  noteId: string;
  contentJson: string;
  contentHash: string;
  expectedVersion: number | null;
  title?: string;
}

export interface SaveResult {
  id: string;
  version: number;
  title?: string | undefined;
  updatedAt: string;
}

export interface RobustNoteAutosaveReturn {
  /** Whether initial draft hydration has completed */
  isHydrated: boolean;

  /** Current draft state */
  draft: NoteDraftEnvelope;

  /** Current editor state for Lexical */
  editorState: SerializedEditor;

  /** Key to force remount editor when draft is recovered */
  editorKey: number;

  /** Handle editor content changes */
  onEditorContentChange: (state: SerializedEditor) => void;

  /** Handle title changes */
  onTitleChange: (title: string) => void;

  /** Force immediate save */
  forceSave: () => void;

  /** Clear draft from local storage */
  clearDraft: () => Promise<void>;

  /** Whether there's a local draft to recover */
  hasLocalDraft: boolean;

  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;

  /** Accept recovered local draft */
  acceptLocalDraft: () => void;

  /** Discard recovered local draft */
  discardLocalDraft: () => Promise<void>;
}

/**
 * Create an empty editor state.
 */
function createEmptyEditorState(): SerializedEditor {
  return {
    root: {
      children: [
        {
          children: [],
          direction: null,
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
          textFormat: 0,
          textStyle: "",
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

/**
 * Parse JSON content to editor state, with fallback to empty state.
 */
function parseEditorState(contentJson: string): SerializedEditor {
  try {
    return sanitizeSerializedEditorState(JSON.parse(contentJson) as SerializedEditor);
  } catch {
    return createEmptyEditorState();
  }
}

/**
 * Hydrate draft from IndexedDB or create new from server data.
 *
 * Priority:
 * 1. If there's a dirty local draft (unsaved changes), use that
 * 2. Otherwise, use server content if available
 * 3. Fall back to empty state
 */
async function hydrateDraft(
  noteId: string,
  initialContent: SerializedEditor | undefined,
  initialTitle: string | undefined,
  serverVersion: number | null,
): Promise<{
  draft: NoteDraftEnvelope;
  hasLocalDraft: boolean;
  localDraft: NoteDraftEnvelope | null;
}> {
  // Check for existing local draft
  const localDraft = await draftsDb.noteDrafts.get(noteId);

  // If there's a dirty local draft (unsaved changes), offer recovery
  if (localDraft?.dirty) {
    return {
      draft: localDraft,
      hasLocalDraft: true,
      localDraft,
    };
  }

  // If there's a local draft but it's not dirty, and we have server content,
  // prefer the server content (it's more authoritative)
  // This handles the case where you save a note, then open it again
  if (localDraft && !localDraft.dirty && initialContent) {
    // Clear the stale local draft
    await draftsDb.noteDrafts.delete(noteId);
    removeDraftMeta(noteId);
  }

  // Create from initial/server data
  const sanitizedInitialContent = initialContent
    ? sanitizeSerializedEditorState(initialContent)
    : undefined;
  const contentJson = sanitizedInitialContent
    ? JSON.stringify(sanitizedInitialContent)
    : JSON.stringify(createEmptyEditorState());
  const contentHash = stableHash(contentJson);

  const newDraft: NoteDraftEnvelope = {
    noteId,
    contentJson,
    contentHash,
    localRevision: 1,
    serverVersion,
    dirty: false,
    syncState: initialContent ? "synced" : "idle",
    updatedAt: Date.now(),
    lastSyncedAt: initialContent ? Date.now() : null,
    title: initialTitle ?? null,
    patientId: null,
    sessionId: null,
  };

  return {
    draft: newDraft,
    hasLocalDraft: false,
    localDraft: null,
  };
}

export function useRobustNoteAutosave({
  noteId,
  initialContent,
  initialTitle,
  serverVersion,
  onSave,
}: UseRobustNoteAutosaveParams): RobustNoteAutosaveReturn {
  // Track if we've hydrated from IndexedDB
  const [isHydrated, setIsHydrated] = useState(false);
  const isHydratedRef = useRef(false);
  const pendingChangeRef = useRef<{ contentJson: string; contentHash: string } | null>(null);
  const pendingTitleRef = useRef<string | null>(null);
  const [draft, setDraft] = useState<NoteDraftEnvelope>({
    noteId,
    contentJson: JSON.stringify(
      initialContent ? sanitizeSerializedEditorState(initialContent) : createEmptyEditorState(),
    ),
    contentHash: "",
    localRevision: 0,
    serverVersion: null,
    dirty: false,
    syncState: "idle",
    updatedAt: Date.now(),
    lastSyncedAt: null,
    title: initialTitle ?? null,
    patientId: null,
    sessionId: null,
  });

  // Track local draft recovery
  const [localDraftToRecover, setLocalDraftToRecover] = useState<NoteDraftEnvelope | null>(null);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);

  // Editor key for forcing remount when recovering draft
  const [editorKey, setEditorKey] = useState(0);

  // Refs for lifecycle handlers
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // Keep a stable ref to onSave
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Track saving state with ref to avoid re-renders breaking debounce
  const isSavingRef = useRef(false);
  const retryCountRef = useRef(0);

  // Hydrate from IndexedDB on mount
  useEffect(() => {
    let mounted = true;

    void (async () => {
      const result = await hydrateDraft(
        noteId,
        initialContent,
        initialTitle,
        serverVersion ?? null,
      );

      if (!mounted) return;

      const shouldRemountEditor =
        isHydratedRef.current && draftRef.current.contentJson !== result.draft.contentJson;

      setDraft(result.draft);
      draftRef.current = result.draft;
      setHasLocalDraft(result.hasLocalDraft);
      setLocalDraftToRecover(result.hasLocalDraft ? result.localDraft : null);
      setIsHydrated(true);
      isHydratedRef.current = true;

      if (shouldRemountEditor) {
        setEditorKey((key) => key + 1);
      }

      // Process any pending changes that were queued during hydration
      if (pendingChangeRef.current || pendingTitleRef.current !== null) {
        const baseDraft = result.draft;
        let updatedDraft = { ...baseDraft };

        if (pendingChangeRef.current) {
          updatedDraft = {
            ...updatedDraft,
            contentJson: pendingChangeRef.current.contentJson,
            contentHash: pendingChangeRef.current.contentHash,
            localRevision: updatedDraft.localRevision + 1,
            dirty: true,
            syncState: navigator.onLine ? "local-only" : "error",
            updatedAt: Date.now(),
          };
        }

        if (pendingTitleRef.current !== null) {
          updatedDraft = {
            ...updatedDraft,
            title: pendingTitleRef.current || null,
            localRevision: updatedDraft.localRevision + 1,
            dirty: true,
            syncState: navigator.onLine ? "local-only" : "error",
            updatedAt: Date.now(),
          };
        }

        setDraft(updatedDraft);
        draftRef.current = updatedDraft;
        persistLocalRef.current(updatedDraft);
        scheduleRemoteRef.current(updatedDraft);

        pendingChangeRef.current = null;
        pendingTitleRef.current = null;
      }
    })();

    return () => {
      mounted = false;
    };
  }, [noteId, initialContent, initialTitle, serverVersion]);

  // Perform save operation - stable reference
  const performSave = useCallback(async (next: NoteDraftEnvelope) => {
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setDraft((d) => ({ ...d, syncState: "syncing" }));

    try {
      const payload: SavePayload = {
        noteId: next.noteId,
        contentJson: next.contentJson,
        contentHash: next.contentHash,
        expectedVersion: next.serverVersion,
      };

      if (next.title) {
        payload.title = next.title;
      }

      const result = await onSaveRef.current(payload);

      // Success
      setDraft((d) => {
        const newDraft: NoteDraftEnvelope = {
          ...d,
          serverVersion: result.version,
          dirty: false,
          syncState: "synced",
          lastSyncedAt: Date.now(),
        };

        void draftsDb.noteDrafts.put(newDraft);
        writeDraftMeta(noteId, {
          noteId,
          dirty: false,
          updatedAt: newDraft.updatedAt,
          localRevision: newDraft.localRevision,
        });

        return newDraft;
      });

      retryCountRef.current = 0;
    } catch (error) {
      const newSyncState = isConflictError(error) ? "conflict" : "error";

      setDraft((d) => {
        const newDraft: NoteDraftEnvelope = {
          ...d,
          syncState: newSyncState,
        };

        void draftsDb.noteDrafts.put(newDraft);
        return newDraft;
      });

      // Retry with exponential backoff for network errors
      if (!isConflictError(error) && retryCountRef.current < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** retryCountRef.current, 15000);
        setTimeout(() => {
          retryCountRef.current += 1;
          void performSave(draftRef.current);
        }, delay);
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [noteId]);

  // Throttled local persistence
  const persistLocal = useMemo(
    () =>
      throttle((next: NoteDraftEnvelope) => {
        void draftsDb.noteDrafts.put(next);
        writeDraftMeta(noteId, {
          noteId,
          dirty: next.dirty,
          updatedAt: next.updatedAt,
          localRevision: next.localRevision,
        });
      }, LOCAL_THROTTLE_MS),
    [noteId],
  );

  // Debounced remote sync - created once, never recreated
  const scheduleRemote = useMemo(
    () =>
      debounce((next: NoteDraftEnvelope) => {
        if (!navigator.onLine) {
          return;
        }
        void performSave(next);
      }, REMOTE_DEBOUNCE_MS),
    [performSave],
  );

  // Store refs for lifecycle handlers
  const persistLocalRef = useRef(persistLocal);
  const scheduleRemoteRef = useRef(scheduleRemote);
  persistLocalRef.current = persistLocal;
  scheduleRemoteRef.current = scheduleRemote;

  // Handle editor content changes
  const onEditorContentChange = useCallback((state: SerializedEditor) => {
    const contentJson = JSON.stringify(state);
    const contentHash = stableHash(contentJson);

    // Queue changes if not yet hydrated
    if (!isHydratedRef.current) {
      pendingChangeRef.current = { contentJson, contentHash };
      return;
    }

    // Create the new draft first
    const prev = draftRef.current;

    // Skip if content hasn't changed
    if (prev.contentHash === contentHash) {
      return;
    }

    const next: NoteDraftEnvelope = {
      ...prev,
      contentJson,
      contentHash,
      localRevision: prev.localRevision + 1,
      dirty: true,
      syncState: navigator.onLine ? "local-only" : "error",
      updatedAt: Date.now(),
    };

    // Update state and trigger side effects
    setDraft(next);
    draftRef.current = next;

    // Trigger side effects AFTER state update
    persistLocalRef.current(next);
    scheduleRemoteRef.current(next);
  }, []);

  // Handle title changes
  const onTitleChange = useCallback((title: string) => {
    // Queue changes if not yet hydrated
    if (!isHydratedRef.current) {
      pendingTitleRef.current = title;
      return;
    }

    const prev = draftRef.current;

    if (prev.title === title) {
      return;
    }

    const next: NoteDraftEnvelope = {
      ...prev,
      title: title || null,
      localRevision: prev.localRevision + 1,
      dirty: true,
      syncState: navigator.onLine ? "local-only" : "error",
      updatedAt: Date.now(),
    };

    // Update state and trigger side effects
    setDraft(next);
    draftRef.current = next;

    // Trigger side effects AFTER state update
    persistLocalRef.current(next);
    scheduleRemoteRef.current(next);
  }, []);

  // Force immediate save
  const forceSave = useCallback(() => {
    scheduleRemoteRef.current.flush();
    persistLocalRef.current.flush();
  }, []);

  // Clear draft from local storage
  const clearDraft = useCallback(async () => {
    await draftsDb.noteDrafts.delete(noteId);
    removeDraftMeta(noteId);
    setHasLocalDraft(false);
    setLocalDraftToRecover(null);
  }, [noteId]);

  // Accept recovered local draft
  const acceptLocalDraft = useCallback(() => {
    if (localDraftToRecover) {
      setDraft(localDraftToRecover);
      draftRef.current = localDraftToRecover;
      setHasLocalDraft(false);
      setLocalDraftToRecover(null);
      // Increment key to force editor remount with new content
      setEditorKey((k) => k + 1);
    }
  }, [localDraftToRecover]);

  // Discard recovered local draft
  const discardLocalDraft = useCallback(async () => {
    await clearDraft();
    // Reset to initial state
    setDraft((prev) => ({
      ...prev,
      contentJson: JSON.stringify(
        initialContent ? sanitizeSerializedEditorState(initialContent) : createEmptyEditorState(),
      ),
      contentHash: stableHash(
        JSON.stringify(
          initialContent ? sanitizeSerializedEditorState(initialContent) : createEmptyEditorState(),
        ),
      ),
      localRevision: prev.localRevision + 1,
      dirty: false,
      syncState: "synced",
      lastSyncedAt: Date.now(),
    }));
  }, [clearDraft, initialContent]);

  // Lifecycle event handlers
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;

      // Flush pending operations when page becomes hidden
      persistLocalRef.current(draftRef.current);
      scheduleRemoteRef.current.flush();
    };

    const onPageHide = () => {
      persistLocalRef.current(draftRef.current);
      scheduleRemoteRef.current.flush();
    };

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!draftRef.current.dirty) return;

      // Show warning for unsaved changes
      event.preventDefault();
      event.returnValue = true;
    };

    const onOnline = () => {
      // Retry pending sync when back online
      if (draftRef.current.dirty && draftRef.current.syncState !== "syncing") {
        scheduleRemoteRef.current(draftRef.current);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("online", onOnline);

    // Only add beforeunload when dirty
    if (draft.dirty) {
      window.addEventListener("beforeunload", onBeforeUnload);
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [draft.dirty]);

  // Parse editor state for Lexical
  const editorState = useMemo(() => {
    return parseEditorState(draft.contentJson);
  }, [draft.contentJson]);

  return {
    isHydrated,
    draft,
    editorState,
    editorKey,
    onEditorContentChange,
    onTitleChange,
    forceSave,
    clearDraft,
    hasLocalDraft,
    hasUnsavedChanges: draft.dirty,
    acceptLocalDraft,
    discardLocalDraft,
  };
}
