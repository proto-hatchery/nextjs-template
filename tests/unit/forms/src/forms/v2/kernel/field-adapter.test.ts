/* oxlint-disable */
import { describe, expect, it } from "vitest";

import {
  asV2InputField,
  asV2OptionalSelectField,
  asV2RHFOptionalSelectField,
  resolveV2FieldError,
} from "@workspace/forms/v2/kernel/field-adapter";

describe("resolveV2FieldError", () => {
  it("returns undefined for falsy error", () => {
    expect(resolveV2FieldError(undefined)).toBeUndefined();
    expect(resolveV2FieldError(null)).toBeUndefined();
    expect(resolveV2FieldError("")).toBeUndefined();
  });

  it("returns string error as-is", () => {
    expect(resolveV2FieldError("Required")).toBe("Required");
  });

  it("extracts message from array of issues", () => {
    expect(resolveV2FieldError([{ message: "Invalid" }])).toBe("Invalid");
  });

  it("extracts message from object with message property", () => {
    expect(resolveV2FieldError({ message: "Bad input" })).toBe("Bad input");
  });

  it("extracts message from issues array in object", () => {
    expect(resolveV2FieldError({ issues: [{ message: "Issue 1" }] })).toBe("Issue 1");
  });

  it("returns undefined for unrecognizable object", () => {
    expect(resolveV2FieldError({})).toBeUndefined();
  });
});

describe("asV2InputField", () => {
  it("normalizes value to string", () => {
    const field = asV2InputField({
      value: 42,
      onValueChange: () => {},
    } as never);

    expect(field.value).toBe("42");
  });

  it("wraps callback to delegate to original", () => {
    const onChange = vi.fn();
    const field = asV2InputField({
      value: "test",
      onValueChange: onChange,
    });

    field.onValueChange("new-value");
    expect(onChange).toHaveBeenCalledWith("new-value");
  });
});

describe("asV2OptionalSelectField", () => {
  it("normalizes empty string to undefined", () => {
    const field = asV2OptionalSelectField({
      value: "",
      onValueChange: () => {},
    });

    expect(field.value).toBeUndefined();
  });

  it("preserves non-empty string value", () => {
    const field = asV2OptionalSelectField({
      value: "abc",
      onValueChange: () => {},
    });

    expect(field.value).toBe("abc");
  });

  it("converts undefined to undefined", () => {
    const field = asV2OptionalSelectField({
      value: undefined,
      onValueChange: () => {},
    });

    expect(field.value).toBeUndefined();
  });
});

describe("asV2RHFOptionalSelectField", () => {
  it("normalizes undefined to empty string", () => {
    const field = asV2RHFOptionalSelectField({
      value: undefined,
      onValueChange: () => {},
    });

    expect(field.value).toBe("");
  });

  it("preserves non-empty string value", () => {
    const field = asV2RHFOptionalSelectField({
      value: "abc",
      onValueChange: () => {},
    });

    expect(field.value).toBe("abc");
  });
});
