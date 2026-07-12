"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalEditor } from "lexical";
import { useEffect } from "react";

export interface EditorInstancePluginProps {
  onEditorReady?: (editor: LexicalEditor) => void;
}

/**
 * Plugin simples que expõe a instância do editor Lexical para o componente pai.
 */
export function EditorInstancePlugin({ onEditorReady }: EditorInstancePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  return null;
}
