/* oxlint-disable */
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createDictionaryBackedCorrector,
  loadPtBrAccentCandidateIndex,
} from "@workspace/lexical-editor/plugins/autocorrect/dictionary-backed-corrector";
import { createAutoCorrectOverrideStore } from "@workspace/lexical-editor/plugins/autocorrect/override-store";

describe("createDictionaryBackedCorrector", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it("returns null for empty token", () => {
    const corrector = createDictionaryBackedCorrector(
      createAutoCorrectOverrideStore({ storageKey: "test" }),
      {}
    );
    expect(corrector.findCorrection({ rawToken: "", positionContext: "mid-sentence" })).toBeNull();
  });

  it("returns null for short tokens", () => {
    const corrector = createDictionaryBackedCorrector(
      createAutoCorrectOverrideStore({ storageKey: "test" }),
      {}
    );
    expect(corrector.findCorrection({ rawToken: "ab", positionContext: "mid-sentence" })).toBeNull();
  });

  it("returns null for tokens with numbers", () => {
    const corrector = createDictionaryBackedCorrector(
      createAutoCorrectOverrideStore({ storageKey: "test" }),
      {}
    );
    expect(
      corrector.findCorrection({ rawToken: "abc123", positionContext: "mid-sentence" })
    ).toBeNull();
  });

  it("returns null for ALL CAPS tokens", () => {
    const corrector = createDictionaryBackedCorrector(
      createAutoCorrectOverrideStore({ storageKey: "test" }),
      {}
    );
    expect(
      corrector.findCorrection({ rawToken: "ABCDE", positionContext: "mid-sentence" })
    ).toBeNull();
  });

  it("returns null for ignored tokens", () => {
    const overrides = createAutoCorrectOverrideStore({ storageKey: "test" });
    overrides.add("exemplo");
    const corrector = createDictionaryBackedCorrector(overrides, {});
    expect(
      corrector.findCorrection({ rawToken: "exemplo", positionContext: "mid-sentence" })
    ).toBeNull();
  });

  it("corrects using generated candidates", () => {
    const corrector = createDictionaryBackedCorrector(
      createAutoCorrectOverrideStore({ storageKey: "test" }),
      {}
    );
    const result = corrector.findCorrection({ rawToken: "atencao", positionContext: "mid-sentence" });
    expect(result).not.toBeNull();
    expect(result?.correctedToken).toBe("atenção");
  });

  it("applies sentence case at paragraph start", () => {
    const corrector = createDictionaryBackedCorrector(
      createAutoCorrectOverrideStore({ storageKey: "test" }),
      {}
    );
    const result = corrector.findCorrection({
      rawToken: "Atencao",
      positionContext: "paragraph-start",
    });
    expect(result?.correctedToken).toBe("Atenção");
  });

  it("applies sentence case at sentence start", () => {
    const corrector = createDictionaryBackedCorrector(
      createAutoCorrectOverrideStore({ storageKey: "test" }),
      {}
    );
    const result = corrector.findCorrection({
      rawToken: "Atencao",
      positionContext: "sentence-start",
    });
    expect(result?.correctedToken).toBe("Atenção");
  });

  it("returns null when multiple candidates tie", () => {
    const corrector = createDictionaryBackedCorrector(
      createAutoCorrectOverrideStore({ storageKey: "test" }),
      {
        atencao: ["atenção", "aténção"],
      }
    );
    const result = corrector.findCorrection({ rawToken: "atencao", positionContext: "mid-sentence" });
    expect(result).toBeNull();
  });
});

describe("loadPtBrAccentCandidateIndex", () => {
  it("returns a promise", () => {
    const promise = loadPtBrAccentCandidateIndex();
    expect(promise).toBeInstanceOf(Promise);
  });
});
