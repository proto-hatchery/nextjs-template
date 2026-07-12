/**
 * IndexedDB database for offline note drafts using Dexie.
 *
 * This provides local-first persistence for clinical notes,
 * ensuring data survives browser crashes, network issues, and accidental closes.
 *
 * @see ADR-015 for architecture decisions
 */

import { Dexie, type EntityTable } from "dexie";

/**
 * Draft envelope for a clinical note.
 * Stores both the content and sync state for robust auto-save.
 */
export interface NoteDraftEnvelope {
  /** Primary key - the note ID */
  noteId: string;

  /** Lexical editor state as JSON string (not Base64) */
  contentJson: string;

  /** Stable hash of content for deduplication */
  contentHash: string;

  /** Monotonic counter for ordering local changes */
  localRevision: number;

  /** Server version for optimistic concurrency */
  serverVersion: number | null;

  /** Whether there are unsaved local changes */
  dirty: boolean;

  /** Current sync state */
  syncState: "idle" | "local-only" | "syncing" | "synced" | "error" | "conflict";

  /** Timestamp of last local update */
  updatedAt: number;

  /** Timestamp of last successful sync */
  lastSyncedAt: number | null;

  /** Note title (for recovery UI) */
  title: string | null;

  /** Patient ID (for context) */
  patientId: string | null;

  /** Session ID (for context) */
  sessionId: string | null;
}

/**
 * Minimal metadata stored in localStorage for quick "has draft" checks.
 * The full document lives in IndexedDB.
 */
export interface NoteDraftMeta {
  noteId: string;
  dirty: boolean;
  updatedAt: number;
  localRevision: number;
}

/**
 * Dexie database for note drafts.
 */
class NoteDraftsDatabase extends Dexie {
  noteDrafts!: EntityTable<NoteDraftEnvelope, "noteId">;

  constructor() {
    super("fluri-note-drafts");

    this.version(1).stores({
      noteDrafts: "noteId, updatedAt, dirty, syncState, patientId, sessionId",
    });
  }
}

export const draftsDb = new NoteDraftsDatabase();

/**
 * Storage key prefix for localStorage metadata.
 */
const DRAFT_META_PREFIX = "fluri:draft-meta:";

/**
 * Write minimal draft metadata to localStorage.
 * Used for quick "unsaved changes" checks without IndexedDB access.
 */
export function writeDraftMeta(noteId: string, meta: NoteDraftMeta): void {
  try {
    localStorage.setItem(DRAFT_META_PREFIX + noteId, JSON.stringify(meta));
  } catch {
    // localStorage may be full or disabled; ignore
  }
}

/**
 * Read draft metadata from localStorage.
 */
export function readDraftMeta(noteId: string): NoteDraftMeta | null {
  try {
    const raw = localStorage.getItem(DRAFT_META_PREFIX + noteId);
    return raw ? (JSON.parse(raw) as NoteDraftMeta) : null;
  } catch {
    return null;
  }
}

/**
 * Remove draft metadata from localStorage.
 */
export function removeDraftMeta(noteId: string): void {
  try {
    localStorage.removeItem(DRAFT_META_PREFIX + noteId);
  } catch {
    // Ignore
  }
}

/**
 * Check if there are any dirty drafts (for beforeunload warning).
 * Returns array of note IDs with unsaved changes.
 */
export async function getDirtyDrafts(): Promise<string[]> {
  try {
    const drafts = await draftsDb.noteDrafts.where("dirty").equals(1).toArray();
    return drafts.map((d) => d.noteId);
  } catch {
    return [];
  }
}
