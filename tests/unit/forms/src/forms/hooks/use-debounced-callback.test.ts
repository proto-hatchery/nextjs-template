/* oxlint-disable */
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDebouncedCallback } from "@workspace/forms/hooks/use-debounced-callback";

describe("useDebouncedCallback", () => {
  it("delays execution", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 200));

    result.current("a");
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledWith("a");
    vi.useRealTimers();
  });

  it("resets timer on rapid calls", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 200));

    result.current("a");
    vi.advanceTimersByTime(100);
    result.current("b");
    vi.advanceTimersByTime(100);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("b");
    vi.useRealTimers();
  });

  it("uses latest callback reference", () => {
    vi.useFakeTimers();
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 100),
      { initialProps: { cb: callback1 } }
    );

    result.current("x");
    rerender({ cb: callback2 });
    vi.advanceTimersByTime(100);
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith("x");
    vi.useRealTimers();
  });

  it("clears timeout on unmount", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 200));

    result.current("a");
    unmount();
    vi.advanceTimersByTime(200);
    expect(callback).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
