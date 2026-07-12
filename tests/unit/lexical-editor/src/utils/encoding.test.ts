/* oxlint-disable */
import { describe, expect, it } from "vitest";
import type { SerializedEditorState, SerializedElementNode } from "lexical";

import { extractTextFromEditorState, sanitizeSerializedEditorState } from "@workspace/lexical-editor/utils/encoding";

function createStateWithAutocomplete(): SerializedEditorState<SerializedElementNode> {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: "A paciente referiu dificuldade para",
              type: "text",
              version: 1,
            },
            {
              type: "autocomplete",
              uuid: "local-ghost",
              version: 1,
            },
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: " dormir melhor.",
              type: "text",
              version: 1,
            },
          ],
          direction: null,
          format: "",
          indent: 0,
          textFormat: 0,
          textStyle: "",
          type: "paragraph",
          version: 1,
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

describe("encoding autocomplete sanitization", () => {
  it("strips autocomplete nodes from serialized editor state", () => {
    const state = createStateWithAutocomplete();

    const sanitized = sanitizeSerializedEditorState(state);
    const paragraph = sanitized.root.children[0];

    expect(paragraph).toBeTruthy();
    expect("children" in paragraph && paragraph.children).toHaveLength(2);
    expect(
      "children" in paragraph &&
        paragraph.children.every((child) => !("type" in child && child.type === "autocomplete")),
    ).toBe(true);
  });

  it("does not leak autocomplete nodes into extracted plain text", () => {
    const state = createStateWithAutocomplete();

    expect(extractTextFromEditorState(state)).toBe(
      "A paciente referiu dificuldade para dormir melhor.",
    );
  });
});
