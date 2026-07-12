/* oxlint-disable */
import { describe, expect, it } from "vitest";

import { CRP_FORMATTED_REGEX, formatCrp, isValidCrpDigits, isValidFormattedCrp } from "@workspace/forms/utils/crp";

describe("CRP utilities", () => {
  it("formats short and long CRPs without forcing a legacy fixed length", () => {
    expect(formatCrp("06123")).toBe("06/123");
    expect(formatCrp("0612345")).toBe("06/12345");
    expect(formatCrp("06121139")).toBe("06/121139");
  });

  it("preserves an explicit hyphen suffix", () => {
    expect(formatCrp("14/00842-1")).toBe("14/00842-1");
  });

  it("accepts official-style formatted CRP variants", () => {
    expect(isValidFormattedCrp("03/276")).toBe(true);
    expect(isValidFormattedCrp("08/02052")).toBe(true);
    expect(isValidFormattedCrp("06/121139")).toBe(true);
    expect(isValidFormattedCrp("14/00842-1")).toBe(true);
    expect(CRP_FORMATTED_REGEX.test("18/2762")).toBe(true);
  });

  it("rejects malformed CRP values", () => {
    expect(isValidFormattedCrp("06/12")).toBe(false);
    expect(isValidFormattedCrp("06/1234567")).toBe(false);
    expect(isValidFormattedCrp("06/12-3")).toBe(false);
    expect(isValidCrpDigits("0612")).toBe(false);
  });
});
