/* oxlint-disable */
import { describe, expect, it, vi } from "vitest";

import { getV2InputProps, getV2SelectProps, getV2TextareaProps } from "@workspace/forms/v2/rhf/mappers";

describe("v2 mapper omission semantics", () => {
  it("omits undefined optional keys from input bindings", () => {
    const props = getV2InputProps({
      value: "Noa",
      onValueChange: vi.fn(),
    });

    expect(props).toEqual({
      value: "Noa",
      onValueChange: expect.any(Function),
    });
    expect("name" in props).toBe(false);
    expect("onBlur" in props).toBe(false);
    expect("ref" in props).toBe(false);
    expect("errorMessage" in props).toBe(false);
    expect("disabled" in props).toBe(false);
  });

  it("normalizes optional select empty string to undefined without adding extra keys", () => {
    const props = getV2SelectProps({
      value: "",
      onValueChange: vi.fn(),
    });

    expect(props.value).toBeUndefined();
    expect(props).toEqual({
      value: undefined,
      onValueChange: expect.any(Function),
    });
    expect("errorMessage" in props).toBe(false);
    expect("disabled" in props).toBe(false);
  });

  it("maps field errors to errorMessage for textarea bindings", () => {
    const props = getV2TextareaProps({
      value: "hello",
      onValueChange: vi.fn(),
      error: { message: "Required", type: "required" },
      disabled: true,
    });

    expect(props.errorMessage).toBe("Required");
    expect(props.disabled).toBe(true);
    expect(props.value).toBe("hello");
  });
});
