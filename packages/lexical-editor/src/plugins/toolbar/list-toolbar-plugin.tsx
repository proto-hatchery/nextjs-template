"use client";

import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import { $getSelection, $isRangeSelection, $isRootOrShadowRoot, type BaseSelection } from "lexical";
import { ListIcon, ListOrderedIcon, ListTodoIcon, QuoteIcon } from "lucide-react";
import { useState } from "react";

import { BrandButton } from "@workspace/brand/components/brand-button";

import { useToolbarContext } from "@workspace/lexical-editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@workspace/lexical-editor/editor-hooks/use-update-toolbar";

export function ListToolbarPlugin() {
  const { activeEditor, blockType } = useToolbarContext();
  const [currentListType, setCurrentListType] = useState<string | null>(null);

  const $updateToolbar = (selection: BaseSelection) => {
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

      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
        const type = parentList ? parentList.getListType() : element.getListType();
        setCurrentListType(type);
      } else {
        setCurrentListType(null);
      }
    }
  };

  useUpdateToolbarHandler($updateToolbar);

  const formatBulletList = () => {
    if (blockType !== "bullet" && currentListType !== "bullet") {
      activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    activeEditor.focus();
  };

  const formatNumberedList = () => {
    if (blockType !== "number" && currentListType !== "number") {
      activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    activeEditor.focus();
  };

  const formatCheckList = () => {
    if (blockType !== "check" && currentListType !== "check") {
      activeEditor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    activeEditor.focus();
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      activeEditor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
      activeEditor.focus();
    }
  };

  return (
    <>
      <BrandButton
        family="default"
        variant={blockType === "bullet" || currentListType === "bullet" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 w-8 px-0"
        aria-label="Bulleted List"
        onClick={formatBulletList}
      >
        <ListIcon className="size-4" />
      </BrandButton>
      <BrandButton
        family="default"
        variant={blockType === "number" || currentListType === "number" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 w-8 px-0"
        aria-label="Numbered List"
        onClick={formatNumberedList}
      >
        <ListOrderedIcon className="size-4" />
      </BrandButton>
      <BrandButton
        family="default"
        variant={blockType === "check" || currentListType === "check" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 w-8 px-0"
        aria-label="Check List"
        onClick={formatCheckList}
      >
        <ListTodoIcon className="size-4" />
      </BrandButton>
      <BrandButton
        family="default"
        variant={blockType === "quote" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 w-8 px-0"
        aria-label="Quote"
        onClick={formatQuote}
      >
        <QuoteIcon className="size-4" />
      </BrandButton>
    </>
  );
}
