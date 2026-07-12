/* oxlint-disable */
import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  createRequiredSelectIdCodec,
  currencyCodec,
  dateMaskedCodec,
  optionalSelectIdCodec,
  phoneCodec,
} from "@workspace/forms/v2/schema/codecs";

describe("v2 codecs", () => {
  it("encodes and decodes date masked strings", () => {
    const decoded = z.decode(dateMaskedCodec, "06/02/2026");
    expect(decoded).toBeInstanceOf(Date);
    expect(decoded?.getFullYear()).toBe(2026);
    expect(z.encode(dateMaskedCodec, decoded)).toBe("06/02/2026");
    expect(z.decode(dateMaskedCodec, "")).toBeUndefined();
  });

  it("encodes and decodes currency", () => {
    expect(z.decode(currencyCodec, "R$ 1.234,56")).toBe(1234.56);
    expect(z.decode(currencyCodec, "")).toBeUndefined();
    expect(z.encode(currencyCodec, 25)).toBe("R$\u00a025,00");
  });

  it("encodes and decodes phone", () => {
    expect(z.decode(phoneCodec, "+5511999999999")).toBe("+5511999999999");
    expect(z.decode(phoneCodec, "(11) 99999-9999")).toBe("+11999999999");
    expect(z.decode(phoneCodec, "")).toBeUndefined();
    expect(z.encode(phoneCodec, "+5511999999999")).toBe("+5511999999999");
  });

  it("encodes and decodes optional select ids", () => {
    expect(z.decode(optionalSelectIdCodec, "abc")).toBe("abc");
    expect(z.decode(optionalSelectIdCodec, "")).toBeUndefined();
    expect(z.encode(optionalSelectIdCodec, undefined)).toBe("");
    expect(z.encode(optionalSelectIdCodec, "patient_1")).toBe("patient_1");
  });

  it("keeps required select ids RHF-safe while validating required values", () => {
    const codec = createRequiredSelectIdCodec("Selecione o paciente");

    expect(z.decode(codec, "patient_1")).toBe("patient_1");
    expect(z.encode(codec, "patient_1")).toBe("patient_1");
    expect(() => z.decode(codec, "")).toThrow("Selecione o paciente");
    expect(() => z.parse(codec, "")).toThrow("Selecione o paciente");
  });
});
