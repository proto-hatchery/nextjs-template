"use client";

import { INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from "lexical";
import { IndentDecreaseIcon, IndentIncreaseIcon } from "lucide-react";

import { BrandButton } from "@workspace/brand/components/brand-button";

import { useToolbarContext } from "@workspace/lexical-editor/context/toolbar-context";

export function IndentationToolbarPlugin() {
  const { activeEditor } = useToolbarContext();

  return (
    <div className="flex items-center gap-0">
      <BrandButton
        family="default"
        variant="ghost"
        size="sm"
        className="h-8 w-8 px-0"
        aria-label="Outdent"
        onClick={() => {
          activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        }}
      >
        <IndentDecreaseIcon className="size-4" />
      </BrandButton>
      <BrandButton
        family="default"
        variant="ghost"
        size="sm"
        className="h-8 w-8 px-0"
        aria-label="Indent"
        onClick={() => {
          activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }}
      >
        <IndentIncreaseIcon className="size-4" />
      </BrandButton>
    </div>
  );
}
