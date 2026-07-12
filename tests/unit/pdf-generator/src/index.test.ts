/* oxlint-disable */
import { describe, expect, it } from "vitest";

describe("pdf-generator index", () => {
  it("has a placeholder module", async () => {
    const mod = await import("@workspace/pdf-generator");
    expect(mod).toBeDefined();
  });
});
