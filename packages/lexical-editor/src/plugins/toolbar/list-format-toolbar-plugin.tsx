"use client";

import { $isListNode, ListNode } from "@lexical/list";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import { $isRangeSelection, $isRootOrShadowRoot, type BaseSelection } from "lexical";

import { Select, SelectContent, SelectGroup, SelectTrigger } from "@workspace/ui/components/select";

import { useToolbarContext } from "@workspace/lexical-editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@workspace/lexical-editor/editor-hooks/use-update-toolbar";
import { blockTypeToBlockName } from "./block-format/block-format-data";

const LIST_TYPES = {
  bullet: blockTypeToBlockName.bullet,
  number: blockTypeToBlockName.number,
  check: blockTypeToBlockName.check,
} as const;

export function ListFormatDropDown({ children }: { children: React.ReactNode }) {
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
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        }
      }
    }
  }

  useUpdateToolbarHandler($updateToolbar);

  // Check if current block type is a list type
  const isListType = blockType in LIST_TYPES;
  const currentListType = isListType ? blockType : "bullet";
  const currentOption = LIST_TYPES[currentListType as keyof typeof LIST_TYPES] ?? LIST_TYPES.bullet;

  if (!currentOption) {
    return null;
  }

  return (
    <Select
      value={currentListType}
      onValueChange={(value) => {
        setBlockType(value as keyof typeof LIST_TYPES);
      }}
    >
      <SelectTrigger className="h-8 w-auto gap-1 border-0 bg-transparent px-2 shadow-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0">
        {currentOption.icon}
        <span className="text-sm">{currentOption.label}</span>
      </SelectTrigger>
      <SelectContent className="min-w-40">
        <SelectGroup>{children}</SelectGroup>
      </SelectContent>
    </Select>
  );
}
