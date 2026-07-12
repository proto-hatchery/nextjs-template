/* oxlint-disable */
import { describe, expect, it } from "vitest";

import { shouldPreventDateBeforeInput, shouldPreventDateKeyDown } from "@workspace/forms/forms/components/base/v2/date-input-guards";

describe("date input guards", () => {
  it("allows full formatted string insertion for automation flows", () => {
    expect(
      shouldPreventDateBeforeInput({
        data: "15/05/1985",
        inputType: "insertText",
        isComposing: false,
      }),
    ).toBe(false);
  });

  it("allows automation events when inputType is missing", () => {
    expect(
      shouldPreventDateBeforeInput({
        data: "15051985",
        inputType: undefined,
        isComposing: false,
      }),
    ).toBe(false);
  });

  it("still blocks invalid single-character insertions", () => {
    expect(
      shouldPreventDateBeforeInput({
        data: "a",
        inputType: "insertText",
        isComposing: false,
      }),
    ).toBe(true);
  });

  it("allows navigation keys without preventing default", () => {
    expect(
      shouldPreventDateKeyDown({
        altKey: false,
        ctrlKey: false,
        key: "ArrowLeft",
        metaKey: false,
      }),
    ).toBe(false);
  });

  it("blocks invalid printable keys", () => {
    expect(
      shouldPreventDateKeyDown({
        altKey: false,
        ctrlKey: false,
        key: "a",
        metaKey: false,
      }),
    ).toBe(true);
  });
});
