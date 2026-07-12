"use client";

import { useMemo } from "react";

import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState, SerializedEditorState, SerializedElementNode } from "lexical";
import { cn } from "@workspace/ui/lib/utils";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

import { FullPageEditorPlugins } from "./shared/editor-plugins";
import { editorNodes } from "@workspace/lexical-editor/nodes";
import { editorTheme } from "@workspace/lexical-editor/themes/editor-theme";
import type { LexicalEditorProps } from "@workspace/lexical-editor/types";
import { sanitizeSerializedEditorState } from "@workspace/lexical-editor/utils/encoding";

const baseEditorConfig: InitialConfigType = {
  namespace: "LexicalEditor",
  theme: editorTheme,
  nodes: editorNodes,
  onError: (_error: Error) => { /* no-op */ },
};

export function FullPageEditor({
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
      namespace: namespace ?? "FullPageLexicalEditor",
      ...(editorState ? { editorState } : {}),
      ...(serialized ? { editorState: serialized } : {}),
    };
  }, [editorSerializedState, editorState, namespace]);

  return (
    <div className={cn("clinical-note-editor-fullscreen h-full w-full bg-background", className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <TooltipProvider delayDuration={150}>
          <FullPageEditorPlugins
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
