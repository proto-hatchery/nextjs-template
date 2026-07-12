"use client";

import { $isLinkNode } from "@lexical/link";
import { $findMatchingParent } from "@lexical/utils";
import {
  $isElementNode,
  $isRangeSelection,
  type BaseSelection,
  type ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  IndentDecreaseIcon,
  IndentIncreaseIcon,
} from "lucide-react";
import { useState } from "react";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { Separator } from "@workspace/ui/components/separator";

import { useToolbarContext } from "@workspace/lexical-editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@workspace/lexical-editor/editor-hooks/use-update-toolbar";
import { getSelectedNode } from "@workspace/lexical-editor/utils/get-selected-node";

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, "start" | "end" | "">]: {
    icon: React.ReactNode;
    iconRTL: string;
    name: string;
  };
} = {
  left: {
    icon: <AlignLeftIcon className="size-4" />,
    iconRTL: "left-align",
    name: "Left Align",
  },
  center: {
    icon: <AlignCenterIcon className="size-4" />,
    iconRTL: "center-align",
    name: "Center Align",
  },
  right: {
    icon: <AlignRightIcon className="size-4" />,
    iconRTL: "right-align",
    name: "Right Align",
  },
  justify: {
    icon: <AlignJustifyIcon className="size-4" />,
    iconRTL: "justify-align",
    name: "Justify Align",
  },
} as const;

export function ElementFormatToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();

      let matchingParent: ReturnType<typeof $findMatchingParent> | undefined;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || "left",
      );
    }
  };

  useUpdateToolbarHandler($updateToolbar);

  const handleValueChange = (value: string | ElementFormatType) => {
    if (!value) return; // Prevent unselecting current value

    setElementFormat(value as ElementFormatType);

    if (value === "indent") {
      activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
    } else if (value === "outdent") {
      activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
    } else {
      activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value as ElementFormatType);
    }
  };

  return (
    <div className="flex items-center gap-0">
      {/* Alignment buttons */}
      {Object.entries(ELEMENT_FORMAT_OPTIONS).map(([value, option]) => (
        <BrandButton
          family="default"
          key={value}
          variant={elementFormat === value ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 px-0"
          aria-label={option.name}
          onClick={() => handleValueChange(value)}
        >
          {option.icon}
        </BrandButton>
      ))}
      <Separator orientation="vertical" className="mx-1 h-6 w-px bg-border/60" />
      {/* Indentation buttons */}
      <BrandButton
        family="default"
        variant="ghost"
        size="sm"
        className="h-8 w-8 px-0"
        aria-label="Outdent"
        onClick={() => handleValueChange("outdent")}
      >
        <IndentDecreaseIcon className="size-4" />
      </BrandButton>
      <BrandButton
        family="default"
        variant="ghost"
        size="sm"
        className="h-8 w-8 px-0"
        aria-label="Indent"
        onClick={() => handleValueChange("indent")}
      >
        <IndentIncreaseIcon className="size-4" />
      </BrandButton>
    </div>
  );
}
