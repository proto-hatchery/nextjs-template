"use client";

import type { LexicalEditor } from "lexical";
import { createContext, type JSX, useContext, useMemo } from "react";

const Context = createContext<{
  activeEditor: LexicalEditor | null;
  $updateToolbar: () => void;
  blockType: string;
  setBlockType: (blockType: string) => void;
  showModal: (title: string, showModal: (onClose: () => void) => JSX.Element) => void;
}>({
  activeEditor: null,
  $updateToolbar: () => { /* no-op */ },
  blockType: "paragraph",
  setBlockType: () => { /* no-op */ },
  showModal: () => { /* no-op */ },
});

export function ToolbarContext({
  activeEditor,
  $updateToolbar,
  blockType,
  setBlockType,
  showModal,
  children,
}: {
  activeEditor: LexicalEditor;
  $updateToolbar: () => void;
  blockType: string;
  setBlockType: (blockType: string) => void;
  showModal: (title: string, showModal: (onClose: () => void) => JSX.Element) => void;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      activeEditor,
      $updateToolbar,
      blockType,
      setBlockType,
      showModal,
    }),
    [activeEditor, $updateToolbar, blockType, setBlockType, showModal],
  );

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}

export function useToolbarContext() {
  const value = useContext(Context);
  if (value.activeEditor === null) {
    throw new Error("useToolbarContext must be used within a ToolbarContext provider");
  }
  return value as typeof value & { activeEditor: LexicalEditor };
}
