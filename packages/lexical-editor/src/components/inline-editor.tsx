"use client";

import { useMemo } from "react";

import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState, SerializedEditorState, SerializedElementNode } from "lexical";
import { cn } from "@workspace/ui/lib/utils";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

import { InlineEditorPlugins } from "./shared/editor-plugins";
import { editorNodes } from "@workspace/lexical-editor/nodes";
import { editorTheme } from "@workspace/lexical-editor/themes/editor-theme";
import type { LexicalEditorProps } from "@workspace/lexical-editor/types";
import { sanitizeSerializedEditorState } from "@workspace/lexical-editor/utils/encoding";

const baseEditorConfig: InitialConfigType = {
  namespace: "LexicalEditor",
  theme: editorTheme,
  nodes: editorNodes,
  onError: (_error: Error) => {
    // Surface errors while keeping the editor usable
  },
};

export function InlineEditor({
  className,
  editorSerializedState,
  editorState,
  namespace,
  onChange,
  onSerializedChange,
  surfaceSessionId,
  noteId,
  locale,
  enabled,
  autoCorrect,
  autocompleteSource,
  onAutocompleteAccepted,
}: LexicalEditorProps) {
  const initialConfig = useMemo(() => {
    const serialized = editorSerializedState ? JSON.stringify(editorSerializedState) : undefined;

    return {
      ...baseEditorConfig,
      namespace: namespace ?? "InlineLexicalEditor",
      ...(editorState ? { editorState } : {}),
      ...(serialized ? { editorState: serialized } : {}),
    };
  }, [editorSerializedState, editorState, namespace]);

  return (
    <div
      className={cn(
        "notion-editor w-full overflow-hidden rounded-3xl border border-border/70 bg-card shadow-lg",
        className,
      )}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <TooltipProvider delayDuration={150}>
          <InlineEditorPlugins
            surfaceSessionId={surfaceSessionId}
            noteId={noteId}
            locale={locale}
            enabled={enabled}
            autoCorrect={autoCorrect}
            autocompleteSource={autocompleteSource}
            onAutocompleteAccepted={onAutocompleteAccepted}
          />
          <OnChangePlugin
            ignoreSelectionChange
            onChange={(nextState: EditorState) => {
              onChange?.(nextState);
              if (onSerializedChange) {
                onSerializedChange(
                  sanitizeSerializedEditorState(
                    nextState.toJSON() as SerializedEditorState<SerializedElementNode>,
                  ),
                );
              }
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
