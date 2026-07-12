"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { RedoIcon, UndoIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { Separator } from "@workspace/ui/components/separator";

import { useToolbarContext } from "@workspace/lexical-editor/context/toolbar-context";

export function HistoryToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const { activeEditor, $updateToolbar } = useToolbarContext();
  const [isEditable, setIsEditable] = useState(editor.isEditable());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor]);

  return (
    <div className="flex items-center gap-0">
      <BrandButton
        family="default"
        disabled={!canUndo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        title="Undo (⌘Z / Ctrl+Z)"
        aria-keyshortcuts="Meta+Z Control+Z"
        type="button"
        aria-label="Undo"
        size="sm"
        variant="ghost"
        className="h-8 w-8 rounded-r-none border-r-0"
      >
        <UndoIcon className="size-4" />
      </BrandButton>
      <Separator orientation="vertical" className="h-6 mx-0" />
      <BrandButton
        family="default"
        disabled={!canRedo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        title="Redo (⇧⌘Z / Ctrl+Y)"
        aria-keyshortcuts="Shift+Meta+Z Control+Y"
        type="button"
        aria-label="Redo"
        variant="ghost"
        size="sm"
        className="h-8 w-8 rounded-l-none border-l-0"
      >
        <RedoIcon className="size-4" />
      </BrandButton>
    </div>
  );
}
