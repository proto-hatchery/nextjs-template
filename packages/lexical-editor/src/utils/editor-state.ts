import type { LexicalEditor, SerializedEditorState, SerializedElementNode } from "lexical";

import { createEmptyEditorState, sanitizeSerializedEditorState } from "./encoding";

export function getLatestEditorState(
  editor: LexicalEditor,
): SerializedEditorState<SerializedElementNode> {
  let serializedState: SerializedEditorState<SerializedElementNode> | null = null;

  editor.getEditorState().read(() => {
    serializedState = sanitizeSerializedEditorState(
      editor.getEditorState().toJSON() as SerializedEditorState<SerializedElementNode>,
    );
  });

  if (!serializedState) {
    throw new Error("[Lexical] Failed to serialize editor state.");
  }

  return serializedState;
}

export function getLatestEditorStateSafe(
  editor: LexicalEditor | null | undefined,
  fallback: SerializedEditorState<SerializedElementNode> = createEmptyEditorState(),
): SerializedEditorState<SerializedElementNode> {
  if (!editor) return fallback;

  try {
    return getLatestEditorState(editor);
  } catch {
    return fallback;
  }
}
