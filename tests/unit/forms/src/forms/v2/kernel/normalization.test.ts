/* oxlint-disable */
import { describe, expect, it } from "vitest";

import {
  normalizeNullableValue,
  normalizeOptionalStringValue,
  normalizeStringValue,
  toOptionalSelectValue,
  toRHFEmptyString,
} from "@workspace/forms/v2/kernel/normalization";

describe("v2 normalization", () => {
  it("normalizes undefined/null/empty for strings", () => {
    expect(normalizeStringValue(undefined)).toBe("");
    expect(normalizeStringValue(null)).toBe("");
    expect(normalizeStringValue(123)).toBe("123");
    expect(normalizeOptionalStringValue("")).toBeUndefined();
    expect(normalizeOptionalStringValue("a")).toBe("a");
  });

  it("maps optional select values and RHF empty transport", () => {
    expect(toOptionalSelectValue(undefined)).toBeUndefined();
    expect(toOptionalSelectValue(null)).toBeUndefined();
    expect(toOptionalSelectValue("")).toBeUndefined();
    expect(toOptionalSelectValue("x")).toBe("x");

    expect(toRHFEmptyString(undefined)).toBe("");
    expect(toRHFEmptyString(null)).toBe("");
    expect(toRHFEmptyString("x")).toBe("x");
  });

  it("normalizes nullable values with fallback", () => {
    expect(normalizeNullableValue(undefined, "fallback")).toBe("fallback");
    expect(normalizeNullableValue(null, "fallback")).toBe("fallback");
    expect(normalizeNullableValue("value", "fallback")).toBe("value");
  });
});
