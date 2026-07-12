"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  HISTORIC_TAG,
  INSERT_LINE_BREAK_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_SPACE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";

import {
  AUTOCOMPLETE_ACCEPT_TAG,
  AUTOCOMPLETE_CLEAR_TAG,
  AUTOCOMPLETE_INSERT_TAG,
  AUTOCORRECT_UPDATE_TAG,
} from "./editor-update-tags";
import {
  createDictionaryBackedCorrector,
  type AutoCorrectPositionContext,
  type DictionaryBackedCorrector,
  loadPtBrAccentCandidateIndex,
} from "./autocorrect/dictionary-backed-corrector";
import { createAutoCorrectOverrideStore } from "./autocorrect/override-store";

const DEFAULT_STORAGE_KEY = "fluri.lexical.autocorrect.pt-BR.v1";
const PUNCTUATION_BOUNDARY_KEYS = new Set([".", ",", ";", ":", "!", "?"]);
const preloadedAccentCandidateIndexPromise = loadPtBrAccentCandidateIndex();

interface AppliedCorrectionSnapshot {
  correctedToken: string;
  nodeKey: string;
  rawToken: string;
  tokenStart: number;
}

interface CorrectionTarget {
  anchorOffset: number;
  boundaryText: string;
  nodeKey: string;
  positionContext: AutoCorrectPositionContext;
  rawToken: string;
  textNodeStyle: string;
  tokenLength: number;
  tokenStart: number;
}

interface PendingCorrectionAttempt {
  anchorOffset: number;
  boundaryText: string;
  nodeKey: string;
  positionContext: AutoCorrectPositionContext;
  rawToken: string;
  textNodeStyle: string;
  tokenLength: number;
  tokenStart: number;
}

export function canReplayQueuedCorrection(args: {
  anchorOffset: number;
  boundaryText: string;
  currentSlice: string;
  nodeKey: string;
  pendingAttempt: PendingCorrectionAttempt;
  selectionNodeKey: string;
}): boolean {
  return (
    args.selectionNodeKey === args.pendingAttempt.nodeKey &&
    args.anchorOffset === args.pendingAttempt.anchorOffset &&
    args.nodeKey === args.pendingAttempt.nodeKey &&
    args.currentSlice === `${args.pendingAttempt.rawToken}${args.boundaryText}`
  );
}

function isAutocompleteTag(tags: ReadonlySet<string>): boolean {
  return (
    tags.has(AUTOCOMPLETE_ACCEPT_TAG) ||
    tags.has(AUTOCOMPLETE_CLEAR_TAG) ||
    tags.has(AUTOCOMPLETE_INSERT_TAG)
  );
}

export function getAutoCorrectPositionContext(textBeforeToken: string): AutoCorrectPositionContext {
  const trimmed = textBeforeToken.replace(/\s+$/u, "");
  if (trimmed.length === 0) {
    return "paragraph-start";
  }

  if (/[.!?]\s*$/u.test(trimmed)) {
    return "sentence-start";
  }

  return "mid-sentence";
}

export function shouldRegisterOverrideOnHistoricUpdate(args: {
  hasInterveningMutation: boolean;
  undoRequested: boolean;
}): boolean {
  return args.undoRequested && !args.hasInterveningMutation;
}

function buildCorrectionTarget(
  boundaryText: string,
  useInsertedBoundary: boolean,
): CorrectionTarget | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }

  const anchorNode = selection.anchor.getNode();
  if (!$isTextNode(anchorNode) || !anchorNode.isSimpleText()) {
    return null;
  }

  if (anchorNode.getMode() !== "normal" || anchorNode.getFormat() !== 0) {
    return null;
  }

  const anchorOffset = selection.anchor.offset;
  if (anchorOffset <= 0) {
    return null;
  }

  const textContent = anchorNode.getTextContent();
  const textBeforeCursor = textContent.slice(0, anchorOffset);

  if (useInsertedBoundary) {
    if (anchorOffset <= boundaryText.length || !textBeforeCursor.endsWith(boundaryText)) {
      return null;
    }
  } else if (boundaryText.length === 0) {
    const nextCharacter = textContent.slice(anchorOffset, anchorOffset + 1);
    if (nextCharacter && /\p{L}/u.test(nextCharacter)) {
      return null;
    }
  }

  const textBeforeBoundary = useInsertedBoundary
    ? textBeforeCursor.slice(0, -boundaryText.length)
    : textBeforeCursor;
  const rawTokenMatch = textBeforeBoundary.match(/(\p{L}+)\s*$/u);
  if (!rawTokenMatch) {
    return null;
  }

  const rawToken = rawTokenMatch[1];
  if (!rawToken) {
    return null;
  }

  const tokenStart =
    anchorOffset - rawToken.length - (useInsertedBoundary ? boundaryText.length : 0);
  const textBeforeToken = textBeforeBoundary.slice(0, -rawToken.length);

  return {
    anchorOffset,
    boundaryText,
    nodeKey: anchorNode.getKey(),
    positionContext: getAutoCorrectPositionContext(textBeforeToken),
    rawToken,
    textNodeStyle: anchorNode.getStyle(),
    tokenLength: rawToken.length,
    tokenStart,
  };
}

function queuePendingCorrectionAttempt(
  pendingCorrectionAttemptRef: { current: PendingCorrectionAttempt | null },
  boundaryText: string,
): boolean {
  const target = buildCorrectionTarget(boundaryText, false);
  if (!target) {
    return false;
  }

  pendingCorrectionAttemptRef.current = {
    ...target,
    anchorOffset: target.anchorOffset + boundaryText.length,
  };

  return false;
}

function replayPendingCorrectionAttempt(
  corrector: DictionaryBackedCorrector,
  pendingAttempt: PendingCorrectionAttempt,
  appliedCorrectionRef: { current: AppliedCorrectionSnapshot | null },
): boolean {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return false;
  }

  if (
    selection.anchor.key !== pendingAttempt.nodeKey ||
    selection.anchor.offset !== pendingAttempt.anchorOffset
  ) {
    return false;
  }

  const node = $getNodeByKey(pendingAttempt.nodeKey);
  if (!$isTextNode(node)) {
    return false;
  }

  const currentSlice = node
    .getTextContent()
    .slice(
      pendingAttempt.tokenStart,
      pendingAttempt.tokenStart + pendingAttempt.tokenLength + pendingAttempt.boundaryText.length,
    );
  if (
    !canReplayQueuedCorrection({
      anchorOffset: selection.anchor.offset,
      boundaryText: pendingAttempt.boundaryText,
      currentSlice,
      nodeKey: node.getKey(),
      pendingAttempt,
      selectionNodeKey: selection.anchor.key,
    })
  ) {
    return false;
  }

  const match = corrector.findCorrection({
    positionContext: pendingAttempt.positionContext,
    rawToken: pendingAttempt.rawToken,
  });
  if (!match) {
    return false;
  }

  node.spliceText(
    pendingAttempt.tokenStart,
    pendingAttempt.tokenLength + pendingAttempt.boundaryText.length,
    `${match.correctedToken}${pendingAttempt.boundaryText}`,
    true,
  );

  const latestNode = $getNodeByKey(pendingAttempt.nodeKey);
  if ($isTextNode(latestNode) && latestNode.getStyle() !== pendingAttempt.textNodeStyle) {
    latestNode.setStyle(pendingAttempt.textNodeStyle);
  }

  appliedCorrectionRef.current = {
    correctedToken: match.correctedToken,
    nodeKey: pendingAttempt.nodeKey,
    rawToken: match.rawToken,
    tokenStart: pendingAttempt.tokenStart,
  };

  return true;
}

function applyCorrectionForBoundary(
  corrector: DictionaryBackedCorrector,
  boundaryText: string,
  appliedCorrectionRef: { current: AppliedCorrectionSnapshot | null },
): boolean {
  const target = buildCorrectionTarget(boundaryText, false);
  if (!target) {
    return false;
  }

  const match = corrector.findCorrection({
    positionContext: target.positionContext,
    rawToken: target.rawToken,
  });
  if (!match) {
    return false;
  }

  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return false;
  }

  const anchorNode = selection.anchor.getNode();
  if (!$isTextNode(anchorNode)) {
    return false;
  }

  anchorNode.spliceText(
    target.tokenStart,
    target.tokenLength,
    `${match.correctedToken}${boundaryText}`,
    true,
  );

  const latestNode = $getNodeByKey(target.nodeKey);
  if ($isTextNode(latestNode) && latestNode.getStyle() !== target.textNodeStyle) {
    latestNode.setStyle(target.textNodeStyle);
  }

  appliedCorrectionRef.current = {
    correctedToken: match.correctedToken,
    nodeKey: target.nodeKey,
    rawToken: match.rawToken,
    tokenStart: target.tokenStart,
  };

  return true;
}

function applyCorrectionForInsertedBoundary(
  corrector: DictionaryBackedCorrector,
  boundaryText: string,
  appliedCorrectionRef: { current: AppliedCorrectionSnapshot | null },
): boolean {
  const target = buildCorrectionTarget(boundaryText, true);
  if (!target) {
    return false;
  }

  const match = corrector.findCorrection({
    positionContext: target.positionContext,
    rawToken: target.rawToken,
  });
  if (!match) {
    return false;
  }

  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return false;
  }

  const anchorNode = selection.anchor.getNode();
  if (!$isTextNode(anchorNode)) {
    return false;
  }

  anchorNode.spliceText(
    target.tokenStart,
    target.tokenLength + boundaryText.length,
    `${match.correctedToken}${boundaryText}`,
    true,
  );

  const latestNode = $getNodeByKey(target.nodeKey);
  if ($isTextNode(latestNode) && latestNode.getStyle() !== target.textNodeStyle) {
    latestNode.setStyle(target.textNodeStyle);
  }

  appliedCorrectionRef.current = {
    correctedToken: match.correctedToken,
    nodeKey: target.nodeKey,
    rawToken: match.rawToken,
    tokenStart: target.tokenStart,
  };

  return true;
}

export interface AutoCorrectPluginProps {
  enabled?: boolean | undefined;
  locale?: "pt-BR" | undefined;
  persistOverrides?: boolean | undefined;
  storageKey?: string | undefined;
}

export function AutoCorrectPlugin({
  enabled = false,
  locale,
  persistOverrides = true,
  storageKey = DEFAULT_STORAGE_KEY,
}: AutoCorrectPluginProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [corrector, setCorrector] = useState<DictionaryBackedCorrector | null>(null);
  const isComposingRef = useRef(false);
  const appliedCorrectionRef = useRef<AppliedCorrectionSnapshot | null>(null);
  const pendingCorrectionAttemptRef = useRef<PendingCorrectionAttempt | null>(null);
  const pendingUndoRequestRef = useRef(false);
  const hasInterveningMutationRef = useRef(false);

  useEffect(() => {
    if (!enabled || locale !== "pt-BR") {
      setCorrector(null);
      pendingCorrectionAttemptRef.current = null;
      return;
    }

    let cancelled = false;
    const overrideStore = createAutoCorrectOverrideStore({
      persist: persistOverrides,
      storageKey,
    });

    preloadedAccentCandidateIndexPromise
      .then((accentCandidateIndex) => {
        if (cancelled) {
          return;
        }

        const nextCorrector = createDictionaryBackedCorrector(overrideStore, accentCandidateIndex);
        setCorrector(nextCorrector);

        const pendingAttempt = pendingCorrectionAttemptRef.current;
        if (!pendingAttempt) {
          return;
        }

        editor.update(
          () => {
            const replayed = replayPendingCorrectionAttempt(
              nextCorrector,
              pendingAttempt,
              appliedCorrectionRef,
            );
            if (replayed) {
              pendingUndoRequestRef.current = false;
              hasInterveningMutationRef.current = false;
            }
          },
          { discrete: true, tag: AUTOCORRECT_UPDATE_TAG },
        );

        pendingCorrectionAttemptRef.current = null;
      })
      .catch(() => {
        if (!cancelled) {
          setCorrector(null);
          pendingCorrectionAttemptRef.current = null;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editor, enabled, locale, persistOverrides, storageKey]);

  useEffect(() => {
    if (!enabled || locale !== "pt-BR") {
      return;
    }

    const rootElem = editor.getRootElement();
    const handleCompositionStart = () => {
      isComposingRef.current = true;
    };
    const handleCompositionEnd = () => {
      isComposingRef.current = false;
    };

    if (rootElem !== null) {
      rootElem.addEventListener("compositionstart", handleCompositionStart);
      rootElem.addEventListener("compositionend", handleCompositionEnd);
    }

    return () => {
      if (rootElem !== null) {
        rootElem.removeEventListener("compositionstart", handleCompositionStart);
        rootElem.removeEventListener("compositionend", handleCompositionEnd);
      }
    };
  }, [editor, enabled, locale]);

  useEffect(() => {
    if (!enabled || locale !== "pt-BR") {
      return;
    }

    return editor.registerCommand(
      KEY_SPACE_COMMAND,
      (event) => {
        if (event === null || isComposingRef.current) {
          return false;
        }

        let handled = false;
        editor.update(
          () => {
            if (corrector === null) {
              handled = queuePendingCorrectionAttempt(pendingCorrectionAttemptRef, " ");
              return;
            }

            handled = applyCorrectionForBoundary(corrector, " ", appliedCorrectionRef);
            if (handled) {
              pendingUndoRequestRef.current = false;
              hasInterveningMutationRef.current = false;
            }
          },
          { discrete: true, tag: AUTOCORRECT_UPDATE_TAG },
        );

        if (!handled) {
          return false;
        }

        event.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [corrector, editor, enabled, locale]);

  useEffect(() => {
    if (!enabled || locale !== "pt-BR") {
      return;
    }

    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (event === null || isComposingRef.current) {
          return false;
        }

        let handled = false;
        editor.update(
          () => {
            if (corrector === null) {
              handled = queuePendingCorrectionAttempt(pendingCorrectionAttemptRef, "");
              return;
            }

            handled = applyCorrectionForBoundary(corrector, "", appliedCorrectionRef);
            if (handled) {
              pendingUndoRequestRef.current = false;
              hasInterveningMutationRef.current = false;
            }
          },
          { discrete: true, tag: AUTOCORRECT_UPDATE_TAG },
        );

        if (!handled) {
          return false;
        }

        event.preventDefault();

        if (event.shiftKey) {
          editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
        } else {
          editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
        }

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [corrector, editor, enabled, locale]);

  useEffect(() => {
    if (!enabled || locale !== "pt-BR" || corrector === null) {
      return;
    }

    return editor.registerCommand(
      UNDO_COMMAND,
      () => {
        if (appliedCorrectionRef.current !== null && !hasInterveningMutationRef.current) {
          pendingUndoRequestRef.current = true;
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [corrector, editor, enabled, locale]);

  useEffect(() => {
    if (!enabled || locale !== "pt-BR") {
      return;
    }

    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves, tags }) => {
      if (tags.has(AUTOCORRECT_UPDATE_TAG) || isComposingRef.current) {
        return;
      }

      const hasDocumentChange = dirtyElements.size > 0 || dirtyLeaves.size > 0;

      if (isAutocompleteTag(tags)) {
        hasInterveningMutationRef.current = true;
        appliedCorrectionRef.current = null;
        pendingUndoRequestRef.current = false;
        return;
      }

      if (hasDocumentChange && tags.has(HISTORIC_TAG)) {
        const snapshot = appliedCorrectionRef.current;
        if (snapshot === null || corrector === null) {
          pendingUndoRequestRef.current = false;
          hasInterveningMutationRef.current = false;
          return;
        }

        const shouldRegisterOverride = shouldRegisterOverrideOnHistoricUpdate({
          hasInterveningMutation: hasInterveningMutationRef.current,
          undoRequested: pendingUndoRequestRef.current,
        });

        editor.getEditorState().read(() => {
          if (!shouldRegisterOverride) {
            appliedCorrectionRef.current = null;
            pendingUndoRequestRef.current = false;
            hasInterveningMutationRef.current = false;
            return;
          }

          const node = $getNodeByKey(snapshot.nodeKey);
          if (!$isTextNode(node)) {
            corrector.ignoreToken(snapshot.rawToken);
          } else {
            const currentSlice = node
              .getTextContent()
              .slice(snapshot.tokenStart, snapshot.tokenStart + snapshot.correctedToken.length)
              .toLocaleLowerCase("pt-BR");

            if (currentSlice !== snapshot.correctedToken) {
              corrector.ignoreToken(snapshot.rawToken);
            }
          }

          appliedCorrectionRef.current = null;
          pendingUndoRequestRef.current = false;
          hasInterveningMutationRef.current = false;
        });

        return;
      }

      if (hasDocumentChange && appliedCorrectionRef.current !== null) {
        hasInterveningMutationRef.current = true;
        appliedCorrectionRef.current = null;
        pendingUndoRequestRef.current = false;
      }

      if (!hasDocumentChange || corrector === null) {
        return;
      }

      editor.update(
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return;
          }

          const anchorNode = selection.anchor.getNode();
          if (!$isTextNode(anchorNode) || !anchorNode.isSimpleText()) {
            return;
          }

          if (anchorNode.getMode() !== "normal" || anchorNode.getFormat() !== 0) {
            return;
          }

          const anchorOffset = selection.anchor.offset;
          if (anchorOffset <= 0) {
            return;
          }

          const textBeforeCursor = anchorNode.getTextContent().slice(0, anchorOffset);
          const boundaryText = textBeforeCursor.slice(-1);
          if (!PUNCTUATION_BOUNDARY_KEYS.has(boundaryText)) {
            return;
          }

          const corrected = applyCorrectionForInsertedBoundary(
            corrector,
            boundaryText,
            appliedCorrectionRef,
          );
          if (corrected) {
            pendingUndoRequestRef.current = false;
            hasInterveningMutationRef.current = false;
          }
        },
        { discrete: true, tag: AUTOCORRECT_UPDATE_TAG },
      );
    });
  }, [corrector, editor, enabled, locale]);

  useEffect(() => {
    if (!enabled || locale !== "pt-BR") {
      appliedCorrectionRef.current = null;
      pendingCorrectionAttemptRef.current = null;
      pendingUndoRequestRef.current = false;
      hasInterveningMutationRef.current = false;
    }
  }, [enabled, locale]);

  return null;
}
