"use client";

import { computePosition, flip, offset, shift } from "@floating-ui/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createParagraphNode, $getSelection, $isRangeSelection, type TextNode } from "lexical";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { type JSX, type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Command, CommandGroup, CommandItem, CommandList } from "@workspace/ui/components/command";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

import { useEditorModal } from "@workspace/lexical-editor/editor-hooks/use-modal";

import { ComponentPickerOption } from "./picker/component-picker-option";

type SlashCommandMenuProps = {
  anchorElementRef: RefObject<HTMLElement | null>;
  options: Array<ComponentPickerOption>;
  selectedIndex: number | null;
  setHighlightedIndex: (index: number) => void;
  selectOptionAndCleanUp: (option: ComponentPickerOption) => void;
  queryString: string | null;
};

function SlashCommandMenu({
  anchorElementRef,
  options,
  selectedIndex,
  setHighlightedIndex,
  selectOptionAndCleanUp,
  queryString,
}: SlashCommandMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const previousOptionsLength = useRef(options.length);

  const updatePosition = useCallback(async () => {
    if (!menuRef.current || !anchorElementRef.current) {
      return;
    }

    const { x, y } = await computePosition(anchorElementRef.current, menuRef.current, {
      placement: "bottom-start",
      middleware: [
        offset(8),
        flip({
          fallbackPlacements: ["top-start", "bottom-start"],
        }),
        shift({ padding: 8 }),
      ],
    });

    menuRef.current.style.left = `${x}px`;
    menuRef.current.style.top = `${y}px`;
  }, [anchorElementRef]);

  useEffect(() => {
    // Initial position
    void updatePosition();

    const handleReposition = () => {
      void updatePosition();
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [updatePosition]);

  useEffect(() => {
    if (previousOptionsLength.current === 0 && options.length > 0) {
      void updatePosition();
    }
    previousOptionsLength.current = options.length;
  }, [options.length, updatePosition]);

  const isEmptyState =
    options.length === 1 && options[0] !== undefined && "__isEmptyState" in options[0];
  const emptyStateOption = isEmptyState ? options[0] : null;

  // If empty state, don't show any sections, just the option
  const suggestedOptions = isEmptyState ? [] : queryString ? [] : options.slice(0, 3);
  const filteredOptions = isEmptyState ? [] : queryString ? options : [];
  const basicBlockOptions = isEmptyState ? [] : queryString ? [] : options.slice(3);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-80 rounded-lg border border-border/80 bg-popover/95 text-popover-foreground shadow-xl backdrop-blur"
    >
      <Command
        className="rounded-lg bg-transparent"
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setIsKeyboardNavigation(true);
            setHighlightedIndex(
              selectedIndex !== null
                ? (selectedIndex - 1 + options.length) % options.length
                : options.length - 1,
            );
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setIsKeyboardNavigation(true);
            setHighlightedIndex(selectedIndex !== null ? (selectedIndex + 1) % options.length : 0);
          }
        }}
        onMouseMove={() => {
          if (isKeyboardNavigation) {
            setIsKeyboardNavigation(false);
          }
        }}
      >
        <ScrollArea className="max-h-[400px]">
          <CommandList className="px-1.5 py-2">
            {suggestedOptions.length > 0 && (
              <CommandGroup className="pb-2">
                <div className="px-1.5 pb-1 text-xs font-medium text-muted-foreground">
                  Suggested
                </div>
                {suggestedOptions.map((option, index) => (
                  <CommandItem
                    key={option.key}
                    value={option.title}
                    onSelect={() => {
                      selectOptionAndCleanUp(option);
                    }}
                    className={`flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm ${
                      selectedIndex === index ? "bg-accent text-accent-foreground" : ""
                    } ${isKeyboardNavigation ? "pointer-events-none" : ""}`}
                  >
                    <span className="flex size-5 items-center justify-center text-muted-foreground">
                      {option.icon}
                    </span>
                    <span className="flex-1">{option.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredOptions.length > 0 && (
              <CommandGroup>
                <div className="px-1.5 pb-1 text-xs font-medium text-muted-foreground">
                  Filtered
                </div>
                {filteredOptions.map((option, index) => (
                  <CommandItem
                    key={option.key}
                    value={option.title}
                    onSelect={() => {
                      selectOptionAndCleanUp(option);
                    }}
                    className={`flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm ${
                      selectedIndex === index ? "bg-accent text-accent-foreground" : ""
                    } ${isKeyboardNavigation ? "pointer-events-none" : ""}`}
                  >
                    <span className="flex size-5 items-center justify-center text-muted-foreground">
                      {option.icon}
                    </span>
                    <span className="flex-1">{option.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {basicBlockOptions.length > 0 && (
              <CommandGroup>
                <div className="px-1.5 pb-1 text-xs font-medium text-muted-foreground">
                  Basic blocks
                </div>
                {basicBlockOptions.map((option, index) => {
                  const actualIndex = suggestedOptions.length + index;
                  return (
                    <CommandItem
                      key={option.key}
                      value={option.title}
                      onSelect={() => {
                        selectOptionAndCleanUp(option);
                      }}
                      className={`flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm ${
                        selectedIndex === actualIndex ? "bg-accent text-accent-foreground" : ""
                      } ${isKeyboardNavigation ? "pointer-events-none" : ""}`}
                    >
                      <span className="flex size-5 items-center justify-center text-muted-foreground">
                        {option.icon}
                      </span>
                      <span className="flex-1">{option.title}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {isEmptyState && emptyStateOption && (
              <CommandGroup className="p-0">
                <CommandItem
                  value={emptyStateOption.title}
                  onSelect={() => {
                    selectOptionAndCleanUp(emptyStateOption);
                  }}
                  className="flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-sm text-muted-foreground m-0"
                >
                  <span>Type</span>
                  <span className="font-medium text-foreground">/{queryString}</span>
                  <span>on the page</span>
                  <span className="ml-auto text-xs opacity-60">esc</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </ScrollArea>
      </Command>
    </div>
  );
}

export function ComponentPickerMenuPlugin({
  baseOptions = [],
  dynamicOptionsFn,
}: {
  baseOptions?: Array<ComponentPickerOption>;
  dynamicOptionsFn?: ({ queryString }: { queryString: string }) => Array<ComponentPickerOption>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useEditorModal();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    const filtered = [
      ...(dynamicOptionsFn?.({ queryString }) || []),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) || option.keywords.some((keyword) => regex.test(keyword)),
      ),
    ];

    if (filtered.length === 0) {
      const emptyStateOption = new ComponentPickerOption(`Type /${queryString} on the page`, {
        keywords: ["__empty_state__"],
        onSelect: () => { /* no-op */ },
      });
      Object.defineProperty(emptyStateOption, "__isEmptyState", { value: true, enumerable: false });
      return [emptyStateOption];
    }

    return filtered;
  }, [queryString, baseOptions, dynamicOptionsFn]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        // If it's the empty state option, keep the text as is (including "/") and add a space
        if ("__isEmptyState" in selectedOption) {
          if (nodeToRemove) {
            // Add a space after the text to exit command context
            const currentText = nodeToRemove.getTextContent();
            nodeToRemove.setTextContent(`${currentText} `);

            // Move cursor to the end (after the space)
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const textLength = nodeToRemove.getTextContent().length;
              selection.anchor.set(nodeToRemove.getKey(), textLength, "text");
              selection.focus.set(nodeToRemove.getKey(), textLength, "text");
            }
          }
          closeMenu();
          return;
        }

        if (nodeToRemove) {
          const parentBlock = nodeToRemove.getParent();

          const hasOtherContent = parentBlock?.getChildren().some((child) => {
            if (child === nodeToRemove) return false;
            if (child.getType() === "text") {
              const textContent = (child as TextNode).getTextContent().trim();
              return textContent.length > 0;
            }
            return true;
          });

          nodeToRemove.remove();

          if (hasOtherContent && parentBlock) {
            const newParagraph = $createParagraphNode();
            parentBlock.insertAfter(newParagraph);
            newParagraph.select();
          }
        }

        selectedOption.onSelect(matchingString, editor, showModal);
        closeMenu();
      });
    },
    [editor, showModal],
  );

  return (
    <>
      {modal}
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
        ) => {
          return anchorElementRef.current && (options.length > 0 || queryString)
            ? createPortal(
                <SlashCommandMenu
                  anchorElementRef={anchorElementRef}
                  options={options}
                  selectedIndex={selectedIndex}
                  selectOptionAndCleanUp={selectOptionAndCleanUp}
                  setHighlightedIndex={setHighlightedIndex}
                  queryString={queryString}
                />,
                anchorElementRef.current,
              )
            : null;
        }}
      />
    </>
  );
}
