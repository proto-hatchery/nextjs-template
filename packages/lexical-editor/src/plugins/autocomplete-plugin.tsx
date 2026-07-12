"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelectionStyleValueForProperty } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import type { NodeKey } from "lexical";
import {
  $addUpdateTag,
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  SKIP_DOM_SELECTION_TAG,
  COMMAND_PRIORITY_LOW,
  HISTORY_MERGE_TAG,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
} from "lexical";
import type { JSX } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  AUTOCOMPLETE_ACCEPT_TAG,
  AUTOCOMPLETE_CLEAR_TAG,
  AUTOCOMPLETE_INSERT_TAG,
  AUTOCORRECT_UPDATE_TAG,
} from "./editor-update-tags";
import { extractEditorAutocompleteContext } from "@workspace/lexical-editor/lib/autocomplete-context";
import {
  $createAutocompleteNode,
  $isAutocompleteNode,
  AutocompleteNode,
  clearAutocompleteSuggestion,
  setAutocompleteSuggestion,
} from "@workspace/lexical-editor/nodes/autocomplete-node";
import type {
  EditorAutocompleteAcceptedEvent,
  EditorAutocompleteSource,
  EditorAutocompleteSourceRequest,
  EditorAutocompleteSourceResult,
} from "@workspace/lexical-editor/types";
import { addSwipeRightListener } from "@workspace/lexical-editor/utils/swipe";

const HISTORY_MERGE = { tag: HISTORY_MERGE_TAG };

declare global {
  interface Navigator {
    userAgentData?: {
      mobile: boolean;
    };
  }
}

type SearchPromise = {
  dismiss: () => void;
  promise: Promise<EditorAutocompleteSourceResult | null>;
};

interface RequestSelectionContext {
  anchorKey: NodeKey;
  anchorOffset: number;
  anchorTextBefore: string;
  fontSize: string;
  format: number;
}

export const uuid = Math.random()
  .toString(36)
  .replace(/[^a-z]+/g, "")
  .substring(0, 5);

function isMobileViewport(): boolean {
  const userAgentData = window.navigator.userAgentData;

  return userAgentData !== undefined
    ? userAgentData.mobile
    : window.innerWidth <= 800 && window.innerHeight <= 600;
}

/**
 * Builds a fingerprint from the request for deduplication.
 * Includes boundary flags to ensure different cursor contexts trigger new requests.
 */
function buildRequestFingerprint(request: EditorAutocompleteSourceRequest): string {
  const boundaryPart = request.boundaryFlags
    ? `${request.boundaryFlags.midWord ? 1 : 0}${request.boundaryFlags.afterSpace ? 1 : 0}${request.boundaryFlags.afterComma ? 1 : 0}${request.boundaryFlags.afterPeriod ? 1 : 0}`
    : "----";

  return `${request.prefixText}\u0000${request.suffixText ?? ""}\u0000${request.recentContextText}\u0000${request.currentWord}\u0000${boundaryPart}`;
}

function buildSearchPromise(
  autocompleteSource: EditorAutocompleteSource,
  request: EditorAutocompleteSourceRequest,
): SearchPromise {
  const pending = autocompleteSource(request);

  return {
    dismiss: pending.dismiss,
    promise: pending.promise,
  };
}

function getSelectionTextFormat(selection: ReturnType<typeof $getSelection>): number {
  if (!$isRangeSelection(selection)) {
    return 0;
  }

  const anchorNode = selection.anchor.getNode();
  return $isAutocompleteNode(anchorNode)
    ? 0
    : "getFormat" in anchorNode
      ? anchorNode.getFormat()
      : 0;
}

export interface AutocompletePluginProps {
  surfaceSessionId?: string | undefined;
  noteId?: string | undefined;
  locale?: "pt-BR" | undefined;
  enabled?: boolean | undefined;
  autocompleteSource?: EditorAutocompleteSource | undefined;
  onAutocompleteAccepted?: ((event: EditorAutocompleteAcceptedEvent) => void) | undefined;
}

export function AutocompletePlugin({
  surfaceSessionId,
  enabled = false,
  autocompleteSource,
  onAutocompleteAccepted,
}: AutocompletePluginProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const isSuggestionVisibleRef = useRef(isSuggestionVisible);
  useEffect(() => {
    isSuggestionVisibleRef.current = isSuggestionVisible;
  }, [isSuggestionVisible]);
  const opportunityCountRef = useRef(0);
  const hasAcceptedSuggestionRef = useRef(false);
  const lastRequestRef = useRef<EditorAutocompleteSourceRequest | null>(null);
  const lastResponseRef = useRef<EditorAutocompleteSourceResult | null>(null);
  const isComposingRef = useRef(false);
  const showDesktopHint = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !isMobileViewport();
  }, []);

  useEffect(() => {
    let autocompleteNodeKey: null | NodeKey = null;
    let lastFingerprint: null | string = null;
    let lastRequestSelectionContext: RequestSelectionContext | null = null;
    let searchPromise: null | SearchPromise = null;
    let prevNodeFormat = 0;
    let prevNodeFontSize = "16px";
    const shouldAutocomplete = Boolean(enabled && surfaceSessionId && autocompleteSource);

    function clearSuggestion(markOpportunity = true) {
      clearAutocompleteSuggestion(uuid);
      const autocompleteNode =
        autocompleteNodeKey !== null ? $getNodeByKey(autocompleteNodeKey) : null;

      if (autocompleteNode !== null && autocompleteNode.isAttached()) {
        $addUpdateTag(AUTOCOMPLETE_CLEAR_TAG);
        autocompleteNode.remove();
      }
      autocompleteNodeKey = null;

      if (searchPromise !== null) {
        searchPromise.dismiss();
        searchPromise = null;
      }

      setIsSuggestionVisible(false);

      if (markOpportunity && lastResponseRef.current !== null) {
        opportunityCountRef.current += 1;
      }

      lastFingerprint = null;
      lastRequestSelectionContext = null;
      lastRequestRef.current = null;
      lastResponseRef.current = null;
      prevNodeFormat = 0;
      prevNodeFontSize = "16px";
    }

    function updateAsyncSuggestion(
      pendingSearchPromise: SearchPromise,
      response: EditorAutocompleteSourceResult | null,
      expectedFingerprint: string,
    ) {
      if (
        searchPromise !== pendingSearchPromise ||
        response === null ||
        response.suggestion.trim().length === 0
      ) {
        return;
      }

      editor.update(() => {
        if (
          lastFingerprint !== expectedFingerprint ||
          lastRequestRef.current === null ||
          lastRequestSelectionContext === null
        ) {
          return;
        }

        const selection = $getSelection();
        if (
          !$isRangeSelection(selection) ||
          !selection.isCollapsed() ||
          selection.anchor.key !== lastRequestSelectionContext.anchorKey ||
          selection.anchor.offset !== lastRequestSelectionContext.anchorOffset
        ) {
          return;
        }

        const anchorNode = $getNodeByKey(lastRequestSelectionContext.anchorKey);
        if (!$isTextNode(anchorNode) || !anchorNode.isSimpleText()) {
          return;
        }

        const anchorText = anchorNode.getTextContent();
        const anchorTextBefore = anchorText.slice(0, lastRequestSelectionContext.anchorOffset);
        if (anchorTextBefore !== lastRequestSelectionContext.anchorTextBefore) {
          return;
        }

        prevNodeFormat = lastRequestSelectionContext.format;
        prevNodeFontSize = lastRequestSelectionContext.fontSize;
        setAutocompleteSuggestion(uuid, {
          fontSize: lastRequestSelectionContext.fontSize,
          text: response.suggestion,
        });
        $addUpdateTag(AUTOCOMPLETE_INSERT_TAG);
        $addUpdateTag(SKIP_DOM_SELECTION_TAG);

        const node = $createAutocompleteNode(uuid);
        autocompleteNodeKey = node.getKey();

        if (lastRequestSelectionContext.anchorOffset <= 0) {
          anchorNode.insertBefore(node, false);
          anchorNode.select(0, 0);
        } else if (lastRequestSelectionContext.anchorOffset >= anchorText.length) {
          anchorNode.insertAfter(node, false);
          anchorNode.select(anchorText.length, anchorText.length);
        } else {
          const splitNodes = anchorNode.splitText(lastRequestSelectionContext.anchorOffset);
          const leftNode = splitNodes[0] ?? anchorNode;
          leftNode.insertAfter(node, false);
          leftNode.selectEnd();
        }

        lastResponseRef.current = response;
        setIsSuggestionVisible(true);
      }, HISTORY_MERGE);
    }

    function handleUpdate(
      hasDocumentChange: boolean,
      tags: ReadonlySet<string>,
      dirtyNodeKeys: Set<NodeKey>,
    ) {
      editor.update(() => {
        if (
          tags.has(AUTOCOMPLETE_ACCEPT_TAG) ||
          tags.has(AUTOCOMPLETE_CLEAR_TAG) ||
          tags.has(AUTOCOMPLETE_INSERT_TAG)
        ) {
          return;
        }

        if (tags.has(AUTOCORRECT_UPDATE_TAG)) {
          clearSuggestion(false);
          return;
        }

        if (
          autocompleteNodeKey !== null &&
          dirtyNodeKeys.size === 1 &&
          dirtyNodeKeys.has(autocompleteNodeKey)
        ) {
          return;
        }

        if (!shouldAutocomplete || isComposingRef.current) {
          clearSuggestion();
          return;
        }

        const nextRequest = extractEditorAutocompleteContext();
        if (!nextRequest) {
          clearSuggestion();
          return;
        }

        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          clearSuggestion();
          return;
        }

        const anchorNode = selection.anchor.getNode();
        if (!$isTextNode(anchorNode) || !anchorNode.isSimpleText()) {
          clearSuggestion();
          return;
        }

        const anchorOffset = selection.anchor.offset;

        const nextFingerprint = buildRequestFingerprint(nextRequest);
        if (nextFingerprint === lastFingerprint) {
          return;
        }

        if (!hasDocumentChange) {
          return;
        }

        clearSuggestion(false);

        if (!autocompleteSource) {
          return;
        }

        const pendingSearchPromise = buildSearchPromise(autocompleteSource, nextRequest);
        searchPromise = pendingSearchPromise;
        lastFingerprint = nextFingerprint;
        lastRequestRef.current = nextRequest;
        lastRequestSelectionContext = {
          anchorKey: selection.anchor.key,
          anchorOffset,
          anchorTextBefore: anchorNode.getTextContent().slice(0, anchorOffset),
          fontSize: $getSelectionStyleValueForProperty(selection, "font-size", "16px"),
          format: getSelectionTextFormat(selection),
        };
        lastResponseRef.current = null;

        pendingSearchPromise.promise
          .then((response) => {
            updateAsyncSuggestion(pendingSearchPromise, response, nextFingerprint);
          })
          .catch(() => {
            if (searchPromise === pendingSearchPromise) {
              searchPromise = null;
              lastFingerprint = null;
              lastRequestSelectionContext = null;
            }
          });
      }, HISTORY_MERGE);
    }

    function handleAutocompleteIntent(): boolean {
      if (lastResponseRef.current === null || autocompleteNodeKey === null) {
        return false;
      }

      const autocompleteNode = $getNodeByKey(autocompleteNodeKey);
      if (autocompleteNode === null) {
        return false;
      }

      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return false;
      }

      const fontSize = $getSelectionStyleValueForProperty(selection, "font-size", "16px");
      const textNode = $createTextNode(lastResponseRef.current.suggestion)
        .setFormat(prevNodeFormat)
        .setStyle(`font-size: ${prevNodeFontSize || fontSize}`);

      $addUpdateTag(AUTOCOMPLETE_ACCEPT_TAG);
      autocompleteNode.replace(textNode);
      textNode.selectNext();

      if (lastRequestRef.current !== null && lastResponseRef.current !== null) {
        onAutocompleteAccepted?.({
          request: lastRequestRef.current,
          response: lastResponseRef.current,
        });
      }

      hasAcceptedSuggestionRef.current = true;
      opportunityCountRef.current += 1;
      clearSuggestion(false);
      return true;
    }

    function handleKeypressCommand(event: Event) {
      if (!handleAutocompleteIntent()) {
        return false;
      }

      event.preventDefault();
      return true;
    }

    function handleEscapeCommand(event: KeyboardEvent) {
      if (!isSuggestionVisibleRef.current) {
        return false;
      }

      $addUpdateTag(AUTOCOMPLETE_CLEAR_TAG);
      event.preventDefault();
      clearSuggestion(false);
      return true;
    }

    function handleSwipeRight(_force: number, event: TouchEvent) {
      editor.update(
        () => {
          if (handleAutocompleteIntent()) {
            event.preventDefault();
          } else {
            $addUpdateTag(HISTORY_MERGE.tag);
          }
        },
        { tag: AUTOCOMPLETE_ACCEPT_TAG },
      );
    }

    function handleAutocompleteNodeTransform(node: AutocompleteNode) {
      const key = node.getKey();
      if (node.__uuid === uuid && key !== autocompleteNodeKey) {
        clearSuggestion();
      }
    }

    function handleBlur() {
      editor.update(
        () => {
          clearSuggestion();
        },
        { tag: AUTOCOMPLETE_CLEAR_TAG },
      );
    }

    function handleCompositionStart() {
      isComposingRef.current = true;
      editor.update(
        () => {
          clearSuggestion();
        },
        { tag: AUTOCOMPLETE_CLEAR_TAG },
      );
    }

    function handleCompositionEnd() {
      isComposingRef.current = false;
    }

    function unmountSuggestion() {
      editor.update(
        () => {
          clearSuggestion();
        },
        { tag: AUTOCOMPLETE_CLEAR_TAG },
      );
    }

    const rootElem = editor.getRootElement();

    if (rootElem !== null) {
      rootElem.addEventListener("blur", handleBlur, true);
      rootElem.addEventListener("compositionstart", handleCompositionStart);
      rootElem.addEventListener("compositionend", handleCompositionEnd);
    }

    return mergeRegister(
      editor.registerNodeTransform(AutocompleteNode, handleAutocompleteNodeTransform),
      editor.registerUpdateListener(({ dirtyElements, dirtyLeaves, tags }) => {
        handleUpdate(
          dirtyElements.size > 0 || dirtyLeaves.size > 0,
          tags,
          new Set([...dirtyElements.keys(), ...dirtyLeaves.keys()]),
        );
      }),
      editor.registerCommand(KEY_TAB_COMMAND, handleKeypressCommand, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ARROW_RIGHT_COMMAND, handleKeypressCommand, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, handleEscapeCommand, COMMAND_PRIORITY_LOW),
      ...(rootElem !== null ? [addSwipeRightListener(rootElem, handleSwipeRight)] : []),
      () => {
        if (rootElem !== null) {
          rootElem.removeEventListener("blur", handleBlur, true);
          rootElem.removeEventListener("compositionstart", handleCompositionStart);
          rootElem.removeEventListener("compositionend", handleCompositionEnd);
        }
      },
      unmountSuggestion,
    );
  }, [autocompleteSource, editor, enabled, onAutocompleteAccepted, surfaceSessionId]);

  const shouldShowHint =
    isSuggestionVisible &&
    showDesktopHint &&
    !hasAcceptedSuggestionRef.current &&
    opportunityCountRef.current < 3;

  return shouldShowHint ? (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-3 right-4 z-10 hidden text-xs text-muted-foreground/80 sm:block"
    >
      Tab para aceitar
    </div>
  ) : null;
}
