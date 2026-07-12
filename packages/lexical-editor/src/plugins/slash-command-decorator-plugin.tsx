"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $isTextNode } from "lexical";
import { useEffect } from "react";

/**
 * Plugin to style the slash command trigger text (/) inline in the editor
 * This adds a visual wrapper around "/filter..." text similar to Notion
 */
export function SlashCommandDecoratorPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Clean up function to remove all slash command styling
    const cleanupAllSlashStyling = () => {
      const elements = document.querySelectorAll(".slash-command-trigger");
      elements.forEach((el) => {
        el.classList.remove("slash-command-trigger");
        el.removeAttribute("data-placeholder");
      });
    };

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // First, clean up any existing slash command styling
        cleanupAllSlashStyling();

        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return;
        }

        const anchorNode = selection.anchor.getNode();
        if (!$isTextNode(anchorNode)) {
          return;
        }

        const textContent = anchorNode.getTextContent();

        // Check if text starts with "/" (slash command trigger)
        if (textContent.startsWith("/")) {
          // Find the text node element in the DOM
          const element = editor.getElementByKey(anchorNode.getKey());
          if (element) {
            // Add styling class to the text node
            element.classList.add("slash-command-trigger");

            // Add placeholder if only "/" is typed
            if (textContent === "/") {
              element.setAttribute("data-placeholder", "Filter...");
            } else {
              element.removeAttribute("data-placeholder");
            }
          }
        } else {
          // Remove styling if no longer a slash command
          const element = editor.getElementByKey(anchorNode.getKey());
          if (element) {
            element.classList.remove("slash-command-trigger");
            element.removeAttribute("data-placeholder");
          }
        }
      });
    });
  }, [editor]);

  return null;
}
