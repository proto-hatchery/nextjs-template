"use client";

import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import { $isRangeSelection, $isRootOrShadowRoot, type BaseSelection } from "lexical";

import { Select, SelectContent, SelectGroup, SelectTrigger } from "@workspace/ui/components/select";

import { useToolbarContext } from "@workspace/lexical-editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@workspace/lexical-editor/editor-hooks/use-update-toolbar";
import { blockTypeToBlockName } from "./block-format/block-format-data";

export function BlockFormatDropDown({ children }: { children: React.ReactNode }) {
  const { activeEditor, blockType, setBlockType } = useToolbarContext();

  function $updateToolbar(selection: BaseSelection) {
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        // setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        }
      }
    }
  }

  useUpdateToolbarHandler($updateToolbar);

  // Only show text types (paragraph, headings) in the dropdown
  // If current block is list or quote, show paragraph
  const displayType = ["bullet", "number", "check", "quote"].includes(blockType)
    ? "paragraph"
    : blockType;
  const displayOption = blockTypeToBlockName[displayType] ?? blockTypeToBlockName.paragraph;

  if (!displayOption) {
    return null;
  }

  return (
    <Select
      value={displayType}
      onValueChange={(value) => {
        setBlockType(value as keyof typeof blockTypeToBlockName);
      }}
    >
      <SelectTrigger className="h-8 w-auto border-0 bg-transparent px-2 shadow-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0">
        {displayOption.icon}
      </SelectTrigger>
      <SelectContent className="min-w-48">
        <SelectGroup>{children}</SelectGroup>
      </SelectContent>
    </Select>
  );
}
