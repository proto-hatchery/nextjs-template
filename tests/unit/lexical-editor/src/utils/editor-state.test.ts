/* oxlint-disable */
import { describe, expect, it, vi } from "vitest";

import { getLatestEditorState, getLatestEditorStateSafe } from "@workspace/lexical-editor/utils/editor-state";

describe("getLatestEditorState", () => {
  it("serializes editor state", () => {
    const mockState = {
      root: {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    };

    const editor = {
      getEditorState: vi.fn().mockReturnValue({
        read: (callback: () => void) => callback(),
        toJSON: () => mockState,
      }),
    } as never;

    const result = getLatestEditorState(editor);
    expect(result).toEqual(mockState);
  });

  it("throws when serialization fails", () => {
    const editor = {
      getEditorState: vi.fn().mockReturnValue({
        read: () => {},
        toJSON: () => null,
      }),
    } as never;

    expect(() => getLatestEditorState(editor)).toThrow(
      "[Lexical] Failed to serialize editor state."
    );
  });
});

describe("getLatestEditorStateSafe", () => {
  it("returns fallback for null editor", () => {
    const fallback = {
      root: {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    };
    expect(getLatestEditorStateSafe(null, fallback)).toBe(fallback);
  });

  it("returns fallback on error", () => {
    const fallback = {
      root: {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    };

    const editor = {
      getEditorState: vi.fn().mockReturnValue({
        read: () => {
          throw new Error("fail");
        },
      }),
    } as never;

    expect(getLatestEditorStateSafe(editor, fallback)).toBe(fallback);
  });

  it("returns editor state when successful", () => {
    const mockState = {
      root: {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    };

    const editor = {
      getEditorState: vi.fn().mockReturnValue({
        read: (callback: () => void) => callback(),
        toJSON: () => mockState,
      }),
    } as never;

    expect(getLatestEditorStateSafe(editor)).toEqual(mockState);
  });
});
