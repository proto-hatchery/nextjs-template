import { describe, expect, it } from "vitest";

import { buildPsychologistFullName } from "./psychologist-name";

describe("buildPsychologistFullName", () => {
  it("joins first and last name with a single space", () => {
    expect(buildPsychologistFullName("Ana", "Paula")).toBe("Ana Paula");
  });

  it("trims surrounding whitespace", () => {
    expect(buildPsychologistFullName("  Ana  ", "  Paula ")).toBe("Ana Paula");
  });

  it("returns the available part when one side is missing", () => {
    expect(buildPsychologistFullName("Ana", null)).toBe("Ana");
    expect(buildPsychologistFullName(undefined, "Paula")).toBe("Paula");
  });

  it("returns null when both name parts are empty", () => {
    expect(buildPsychologistFullName(" ", "")).toBeNull();
  });
});
