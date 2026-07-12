import {
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  type ElementNode,
  type LexicalNode,
  $getSelection,
  $getRoot,
} from "lexical";

import type { EditorAutocompleteSourceRequest } from "@workspace/lexical-editor/types";

const EDITOR_CONTEXT_MAX_CHARS = 600;
const CURRENT_PARAGRAPH_MAX_CHARS = 320;
const RECENT_SENTENCES_MAX_CHARS = 200;
const SUFFIX_MAX_CHARS = 80;
const TRIGGER_BOUNDARY_CHARS = new Set([" ", ".", ",", ";", ":", "\n"]);
const SAFE_SHORT_CONTINUATION_TOKENS = new Set([
  "a",
  "à",
  "ao",
  "aos",
  "as",
  "às",
  "com",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "em",
  "na",
  "nas",
  "no",
  "nos",
  "ou",
  "para",
  "por",
]);

export function normalizeAutocompleteWhitespace(value: string): string {
  return value
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncateFromStart(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value;
  }

  return value.slice(value.length - maxChars);
}

function truncateFromEnd(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value;
  }

  return value.slice(0, maxChars);
}

function isWordBoundaryChar(value: string | undefined): boolean {
  return !value || /\s|[.,;:!?()[\]{}"'/-]/u.test(value);
}

function isTriggerBoundaryChar(value: string | undefined): boolean {
  return Boolean(value && TRIGGER_BOUNDARY_CHARS.has(value));
}

function extractCurrentWord(prefixText: string): string {
  const match = prefixText.match(/([^\s.,;:!?()[\]{}"'/-]+)$/u);
  return match?.[1] ?? "";
}

function collectOffsetWithinElement(
  element: ElementNode,
  anchorNode: LexicalNode,
  anchorOffset: number,
): number | null {
  let total = 0;
  let found = false;

  const visit = (node: LexicalNode) => {
    if (found) {
      return;
    }

    if (node.is(anchorNode)) {
      if ($isTextNode(node)) {
        total += anchorOffset;
        found = true;
        return;
      }

      total += anchorOffset;
      found = true;
      return;
    }

    if ($isTextNode(node)) {
      total += node.getTextContentSize();
      return;
    }

    if ($isElementNode(node)) {
      for (const child of node.getChildren()) {
        visit(child);
        if (found) {
          return;
        }
      }
      return;
    }

    total += node.getTextContent().length;
  };

  for (const child of element.getChildren()) {
    visit(child);
    if (found) {
      return total;
    }
  }

  return null;
}

function extractLastSentences(value: string, limit: number): string {
  const trimmed = normalizeAutocompleteWhitespace(value);
  if (!trimmed) {
    return "";
  }

  const matches = trimmed.match(/[^.!?\n]+[.!?\n]?/gu) ?? [trimmed];
  return matches.slice(-limit).join(" ").trim();
}

/**
 * Computes boundary flags based on the character before cursor.
 * These flags help the autocomplete provider make better suggestions.
 */
function computeBoundaryFlags(prefixText: string): {
  midWord: boolean;
  afterSpace: boolean;
  afterComma: boolean;
  afterPeriod: boolean;
  currentWord: string;
} {
  const currentWord = extractCurrentWord(prefixText);
  const lastChar = prefixText.slice(-1);
  const secondLastChar = prefixText.slice(-2, -1);
  const charBeforeLastWhitespace = lastChar === " " ? secondLastChar : lastChar;

  // In the editor we only trigger at stable boundaries, so a trailing token is
  // treated as a completed word rather than an in-word replacement target.
  const midWord = false;

  // afterSpace: last character is a space (but not a double space)
  const afterSpace = lastChar === " " && secondLastChar !== " ";

  // afterComma: cursor is immediately after a comma or after a single space that follows a comma
  const afterComma = charBeforeLastWhitespace === ",";

  // afterPeriod: cursor is after sentence punctuation, including the common ". " case
  const afterPeriod =
    charBeforeLastWhitespace === "." ||
    charBeforeLastWhitespace === "!" ||
    charBeforeLastWhitespace === "?";

  return {
    midWord,
    afterSpace,
    afterComma,
    afterPeriod,
    currentWord,
  };
}

export interface EditorAutocompleteContext extends EditorAutocompleteSourceRequest {
  /** Boundary flags for smarter autocomplete suggestions */
  boundaryFlags: {
    midWord: boolean;
    afterSpace: boolean;
    afterComma: boolean;
    afterPeriod: boolean;
  };
}

export function extractEditorAutocompleteContext(): EditorAutocompleteContext | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }

  const anchorNode = selection.anchor.getNode();
  if (!$isTextNode(anchorNode) || !anchorNode.isSimpleText()) {
    return null;
  }

  const anchorOffset = selection.anchor.offset;
  const nodeText = anchorNode.getTextContent();
  const previousChar = anchorOffset > 0 ? nodeText[anchorOffset - 1] : undefined;
  const nextChar = anchorOffset < nodeText.length ? nodeText[anchorOffset] : undefined;

  if (!isWordBoundaryChar(nextChar)) {
    return null;
  }

  const currentWord = extractCurrentWord(nodeText.slice(0, anchorOffset));
  if (currentWord.length === 0 && !isTriggerBoundaryChar(previousChar)) {
    return null;
  }

  const currentBlock = anchorNode.getTopLevelElementOrThrow();
  if (!$isElementNode(currentBlock)) {
    return null;
  }

  const blockOffset = collectOffsetWithinElement(currentBlock, anchorNode, anchorOffset);
  if (blockOffset === null) {
    return null;
  }

  const blockText = currentBlock.getTextContent();
  const rawParagraphPrefix = blockText.slice(0, blockOffset);
  const normalizedPrefixBeforeCurrentWord = normalizeAutocompleteWhitespace(
    rawParagraphPrefix.slice(0, Math.max(0, rawParagraphPrefix.length - currentWord.length)),
  );
  const allowsShortContinuationToken =
    currentWord.length > 0 &&
    SAFE_SHORT_CONTINUATION_TOKENS.has(currentWord.toLocaleLowerCase("pt-BR")) &&
    normalizedPrefixBeforeCurrentWord.length >= 16;

  if (currentWord.length > 0 && currentWord.length < 3 && !allowsShortContinuationToken) {
    return null;
  }

  const paragraphPrefix = normalizeAutocompleteWhitespace(rawParagraphPrefix);
  const paragraphSuffix = truncateFromEnd(
    normalizeAutocompleteWhitespace(blockText.slice(blockOffset)),
    SUFFIX_MAX_CHARS,
  );

  const root = $getRoot();
  const rootChildren = root.getChildren();
  const currentIndex = rootChildren.findIndex((child) => child.getKey() === currentBlock.getKey());
  const previousBlocksText = rootChildren
    .slice(0, currentIndex)
    .map((child) => child.getTextContent())
    .filter(Boolean)
    .join("\n");

  const recentContextText = truncateFromStart(
    extractLastSentences(previousBlocksText, 2),
    RECENT_SENTENCES_MAX_CHARS,
  );

  const prefixText = truncateFromStart(paragraphPrefix, CURRENT_PARAGRAPH_MAX_CHARS);

  // Compute boundary flags from the raw cursor prefix so trailing spaces and
  // punctuation boundaries are preserved for request semantics.
  const boundaryFlags = computeBoundaryFlags(rawParagraphPrefix);

  return {
    currentWord: boundaryFlags.currentWord,
    prefixText: truncateFromStart(prefixText, EDITOR_CONTEXT_MAX_CHARS),
    suffixText: paragraphSuffix || undefined,
    recentContextText: truncateFromStart(recentContextText, EDITOR_CONTEXT_MAX_CHARS),
    boundaryFlags: {
      midWord: boundaryFlags.midWord,
      afterSpace: boundaryFlags.afterSpace,
      afterComma: boundaryFlags.afterComma,
      afterPeriod: boundaryFlags.afterPeriod,
    },
  };
}
