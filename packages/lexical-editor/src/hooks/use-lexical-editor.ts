"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalEditor } from "lexical";

export function useLexicalEditor(): LexicalEditor {
  const [editor] = useLexicalComposerContext();
  return editor;
}
