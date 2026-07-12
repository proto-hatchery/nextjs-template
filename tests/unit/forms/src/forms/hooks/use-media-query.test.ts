/* oxlint-disable */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "@workspace/forms/hooks/use-media-query";

describe("useMediaQuery", () => {
  it("returns false initially then updates to match media query", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener,
      removeEventListener,
    }));

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(true);
    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("updates value when media query changes", () => {
    let listener: ((event: { matches: boolean }) => void) | null = null;

    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: (_event: string, cb: typeof listener) => {
        listener = cb;
      },
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(false);

    act(() => {
      listener?.({ matches: true });
    });
    expect(result.current).toBe(true);
  });

  it("removes listener on unmount", () => {
    const removeEventListener = vi.fn();

    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener,
    }));

    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
