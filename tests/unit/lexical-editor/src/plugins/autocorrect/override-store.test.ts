/* oxlint-disable */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAutoCorrectOverrideStore } from "@workspace/lexical-editor/plugins/autocorrect/override-store";

describe("createAutoCorrectOverrideStore", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it("adds and checks tokens", () => {
    const store = createAutoCorrectOverrideStore({ storageKey: "test-store" });
    expect(store.has("example")).toBe(false);
    store.add("example");
    expect(store.has("example")).toBe(true);
  });

  it("normalizes tokens to lowercase", () => {
    const store = createAutoCorrectOverrideStore({ storageKey: "test-store" });
    store.add("EXAMPLE");
    expect(store.has("example")).toBe(true);
    expect(store.has("EXAMPLE")).toBe(true);
  });

  it("ignores empty tokens", () => {
    const store = createAutoCorrectOverrideStore({ storageKey: "test-store" });
    store.add("");
    store.add("   ");
    expect(store.has("")).toBe(false);
  });

  it("clears all tokens", () => {
    const store = createAutoCorrectOverrideStore({ storageKey: "test-store" });
    store.add("one");
    store.add("two");
    store.clear();
    expect(store.has("one")).toBe(false);
    expect(store.has("two")).toBe(false);
  });

  it("reads from localStorage on creation", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({
          version: 1,
          expiresAt: Date.now() + 100000,
          ignoredTokens: ["cached"],
        })
      ),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });

    const store = createAutoCorrectOverrideStore({ storageKey: "test-store" });
    expect(store.has("cached")).toBe(true);
  });

  it("persists to localStorage on add", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn().mockReturnValue(null),
      setItem,
      removeItem: vi.fn(),
    });

    const store = createAutoCorrectOverrideStore({ storageKey: "test-store" });
    store.add("persisted");
    expect(setItem).toHaveBeenCalled();
    const payload = JSON.parse(setItem.mock.calls[0][1]);
    expect(payload.version).toBe(1);
    expect(payload.ignoredTokens).toContain("persisted");
  });

  it("removes expired stores", () => {
    const removeItem = vi.fn();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({
          version: 1,
          expiresAt: Date.now() - 1000,
          ignoredTokens: ["expired"],
        })
      ),
      setItem: vi.fn(),
      removeItem,
    });

    const store = createAutoCorrectOverrideStore({ storageKey: "test-store" });
    expect(store.has("expired")).toBe(false);
    expect(removeItem).toHaveBeenCalledWith("test-store");
  });

  it("handles malformed localStorage gracefully", () => {
    const removeItem = vi.fn();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn().mockReturnValue("not-json"),
      setItem: vi.fn(),
      removeItem,
    });

    const store = createAutoCorrectOverrideStore({ storageKey: "test-store" });
    expect(store.has("anything")).toBe(false);
    expect(removeItem).toHaveBeenCalledWith("test-store");
  });

  it("skips persistence when persist is false", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn().mockReturnValue(null),
      setItem,
      removeItem: vi.fn(),
    });

    const store = createAutoCorrectOverrideStore({ storageKey: "test-store", persist: false });
    store.add("no-persist");
    expect(setItem).not.toHaveBeenCalled();
  });
});
