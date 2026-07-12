"use client";

import {
  $isElementNode,
  $isRangeSelection,
  type BaseSelection,
  FORMAT_ELEMENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react";
import { useState } from "react";

import { BrandButton } from "@workspace/brand/components/brand-button";

import { useToolbarContext } from "@workspace/lexical-editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@workspace/lexical-editor/editor-hooks/use-update-toolbar";
import { getSelectedNode } from "@workspace/lexical-editor/utils/get-selected-node";

const ALIGNMENT_OPTIONS = [
  { value: "left", icon: <AlignLeftIcon className="size-4" />, label: "Left Align" },
  { value: "center", icon: <AlignCenterIcon className="size-4" />, label: "Center Align" },
  { value: "right", icon: <AlignRightIcon className="size-4" />, label: "Right Align" },
  { value: "justify", icon: <AlignJustifyIcon className="size-4" />, label: "Justify Align" },
] as const;

export function AlignmentToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  const [elementFormat, setElementFormat] = useState<string>("left");

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();

      if ($isElementNode(parent)) {
        setElementFormat(parent.getFormatType() || "left");
      } else if ($isElementNode(node)) {
        setElementFormat(node.getFormatType() || "left");
      }
    }
  };

  useUpdateToolbarHandler($updateToolbar);

  return (
    <div className="flex items-center gap-0">
      {ALIGNMENT_OPTIONS.map(({ value, icon, label }) => (
        <BrandButton
          family="default"
          key={value}
          variant={elementFormat === value ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 px-0"
          aria-label={label}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value);
            activeEditor.focus();

            // Manually trigger SELECTION_CHANGE_COMMAND to update toolbar
            // This is what gets triggered when user types, forcing toolbar update
            activeEditor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined);
          }}
        >
          {icon}
        </BrandButton>
      ))}
    </div>
  );
}
