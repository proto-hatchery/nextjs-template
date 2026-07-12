/* oxlint-disable */
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PrivacyModeProvider } from "@workspace/core/privacy/privacy-provider";
import {
  maskEmail,
  maskPhone,
} from "@workspace/core/privacy/masking-utils";
import {
  useSensitiveContent,
  useSensitiveValue,
} from "@workspace/core/privacy/use-sensitive-value";

function wrapper(visible = true) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PrivacyModeProvider defaultVisible={visible}>{children}</PrivacyModeProvider>
    );
  };
}

describe("useSensitiveValue", () => {
  it("returns raw value when visible", () => {
    const { result } = renderHook(() => useSensitiveValue("11999998888", maskPhone), {
      wrapper: wrapper(true),
    });
    expect(result.current).toBe("11999998888");
  });

  it("returns masked value when hidden", () => {
    const { result } = renderHook(() => useSensitiveValue("11999998888", maskPhone), {
      wrapper: wrapper(false),
    });
    expect(result.current).toBe("(**) *****-8888");
  });

  it("returns empty string for null/undefined raw value", () => {
    const { result: nullResult } = renderHook(
      () => useSensitiveValue(null, maskPhone),
      { wrapper: wrapper(true) }
    );
    expect(nullResult.current).toBe("");

    const { result: undefinedResult } = renderHook(
      () => useSensitiveValue(undefined, maskPhone),
      { wrapper: wrapper(true) }
    );
    expect(undefinedResult.current).toBe("");
  });
});

describe("useSensitiveContent", () => {
  it("returns visible content when visible", () => {
    const { result } = renderHook(() => useSensitiveContent("show", "hide"), {
      wrapper: wrapper(true),
    });
    expect(result.current).toBe("show");
  });

  it("returns hidden content when hidden", () => {
    const { result } = renderHook(() => useSensitiveContent("show", "hide"), {
      wrapper: wrapper(false),
    });
    expect(result.current).toBe("hide");
  });
});
