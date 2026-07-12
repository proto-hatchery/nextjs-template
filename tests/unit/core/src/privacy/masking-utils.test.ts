/* oxlint-disable */
import { describe, expect, it } from "vitest";

import {
  maskAddress,
  maskCpf,
  maskDate,
  maskEmail,
  maskFull,
  maskPhone,
  maskRg,
} from "@workspace/core/privacy/masking-utils";

describe("maskPhone", () => {
  it("masks a valid phone number showing last 4 digits", () => {
    expect(maskPhone("(11) 99999-9999")).toBe("(**) *****-9999");
  });

  it("returns placeholder for short input", () => {
    expect(maskPhone("123")).toBe("*** ****-****");
  });

  it("handles plain digits", () => {
    expect(maskPhone("11999998888")).toBe("(**) *****-8888");
  });
});

describe("maskEmail", () => {
  it("masks email showing first char and domain", () => {
    expect(maskEmail("noa@example.com")).toBe("n***@example.com");
  });

  it("returns placeholder for invalid email", () => {
    expect(maskEmail("not-an-email")).toBe("***@***.***");
  });

  it("returns placeholder for empty string", () => {
    expect(maskEmail("")).toBe("***@***.***");
  });
});

describe("maskCpf", () => {
  it("masks CPF showing last 2 digits", () => {
    expect(maskCpf("123.456.789-01")).toBe("***.***.***-01");
  });

  it("returns placeholder for invalid length", () => {
    expect(maskCpf("123")).toBe("***.***.***-**");
  });
});

describe("maskRg", () => {
  it("masks RG showing last digit", () => {
    expect(maskRg("12.345.678-9")).toBe("********-9");
  });

  it("returns placeholder for empty input", () => {
    expect(maskRg("")).toBe("********-*");
  });
});

describe("maskDate", () => {
  it("masks any valid date", () => {
    expect(maskDate("1990-03-15")).toBe("**/**/****");
  });

  it("returns placeholder for empty string", () => {
    expect(maskDate("")).toBe("**/**/****");
  });

  it("returns placeholder for invalid date", () => {
    expect(maskDate("not-a-date")).toBe("**/**/****");
  });
});

describe("maskAddress", () => {
  it("returns hidden address label", () => {
    expect(maskAddress("Rua Example, 123")).toBe("[Endereço oculto]");
  });

  it("returns hidden address label for empty string", () => {
    expect(maskAddress("")).toBe("[Endereço oculto]");
  });
});

describe("maskFull", () => {
  it("replaces all characters with asterisks up to 9", () => {
    expect(maskFull("secret")).toBe("******");
  });

  it("caps at 9 asterisks", () => {
    expect(maskFull("verylongsecretvalue")).toBe("*********");
  });

  it("returns placeholder for empty string", () => {
    expect(maskFull("")).toBe("*******");
  });
});
