import type { EditorState, SerializedEditorState, SerializedElementNode } from "lexical";

// Re-export lexical types for consumers that don't want to depend on `lexical` directly
export type { SerializedEditorState, SerializedElementNode } from "lexical";

export type SerializedEditor = SerializedEditorState<SerializedElementNode>;

export interface EditorAutocompleteSourceRequest {
  prefixText: string;
  suffixText?: string | undefined;
  recentContextText: string;
  currentWord: string;
  /** Boundary flags for smarter autocomplete suggestions */
  boundaryFlags?:
    | {
        midWord: boolean;
        afterSpace: boolean;
        afterComma: boolean;
        afterPeriod: boolean;
      }
    | undefined;
}

export interface EditorAutocompleteSourceResult {
  requestId: string;
  suggestion: string;
}

export interface EditorAutocompleteSourcePending {
  dismiss: () => void;
  promise: Promise<EditorAutocompleteSourceResult | null>;
}

export type EditorAutocompleteSource = (
  request: EditorAutocompleteSourceRequest,
) => EditorAutocompleteSourcePending;

export interface EditorAutocompleteAcceptedEvent {
  request: EditorAutocompleteSourceRequest;
  response: EditorAutocompleteSourceResult;
}

export interface LexicalEditorCallbacks {
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (state: SerializedEditor) => void;
}

export interface LexicalEditorAutoCorrectOptions {
  enabled: boolean;
  locale: "pt-BR";
  persistOverrides?: boolean;
  storageKey?: string;
}

export interface LexicalEditorProps extends LexicalEditorCallbacks {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditor;
  namespace?: string;
  className?: string;
  surfaceSessionId?: string;
  noteId?: string;
  locale?: "pt-BR";
  enabled?: boolean;
  autoCorrect?: LexicalEditorAutoCorrectOptions;
  autocompleteSource?: EditorAutocompleteSource;
  onAutocompleteAccepted?: (event: EditorAutocompleteAcceptedEvent) => void;
}
