/* oxlint-disable */
import { describe, expect, it, vi } from "vitest";

import {
  debounce,
  formatTimeAgo,
  isConflictError,
  isNetworkError,
  stableHash,
  throttle,
} from "@workspace/lexical-editor/autosave/autosave-utils";

describe("stableHash", () => {
  it("returns consistent hash for same input", () => {
    expect(stableHash("hello")).toBe(stableHash("hello"));
  });

  it("returns different hash for different input", () => {
    expect(stableHash("hello")).not.toBe(stableHash("world"));
  });

  it("returns a hex string", () => {
    expect(stableHash("test")).toMatch(/^[0-9a-f]+$/);
  });
});

describe("isConflictError", () => {
  it("detects conflict in message", () => {
    expect(isConflictError(new Error("Conflict detected"))).toBe(true);
  });

  it("detects 409 in message", () => {
    expect(isConflictError(new Error("HTTP 409"))).toBe(true);
  });

  it("detects version mismatch", () => {
    expect(isConflictError(new Error("version mismatch"))).toBe(true);
  });

  it("returns false for non-error", () => {
    expect(isConflictError("string")).toBe(false);
  });

  it("returns false for unrelated error", () => {
    expect(isConflictError(new Error("not found"))).toBe(false);
  });
});

describe("isNetworkError", () => {
  it("detects network in message", () => {
    expect(isNetworkError(new Error("network failure"))).toBe(true);
  });

  it("detects fetch in message", () => {
    expect(isNetworkError(new Error("fetch failed"))).toBe(true);
  });

  it("detects offline", () => {
    expect(isNetworkError(new Error("offline"))).toBe(true);
  });

  it("detects timeout", () => {
    expect(isNetworkError(new Error("timeout"))).toBe(true);
  });

  it("returns false for unrelated error", () => {
    expect(isNetworkError(new Error("validation"))).toBe(false);
  });
});

describe("throttle", () => {
  it("calls function immediately on first invocation", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("a");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");
    vi.useRealTimers();
  });

  it("skips calls within wait period", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("a");
    throttled("b");
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("flushes pending call", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("a");
    vi.advanceTimersByTime(50);
    throttled("b");
    throttled.flush();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("b");
    vi.useRealTimers();
  });

  it("cancels pending call", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("a");
    vi.advanceTimersByTime(50);
    throttled("b");
    throttled.cancel();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe("debounce", () => {
  it("delays execution", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("a");
    vi.useRealTimers();
  });

  it("resets timer on rapid calls", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    vi.advanceTimersByTime(50);
    debounced("b");
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("b");
    vi.useRealTimers();
  });

  it("flushes pending call", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    debounced.flush();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("cancels pending call", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    debounced.cancel();
    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe("formatTimeAgo", () => {
  it("formats seconds", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatTimeAgo(now - 5000)).toBe("há 5s");
    vi.useRealTimers();
  });

  it("formats minutes", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatTimeAgo(now - 120000)).toBe("há 2min");
    vi.useRealTimers();
  });

  it("formats hours", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatTimeAgo(now - 7200000)).toBe("há 2h");
    vi.useRealTimers();
  });

  it("formats days", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatTimeAgo(now - 172800000)).toBe("há 2d");
    vi.useRealTimers();
  });
});
