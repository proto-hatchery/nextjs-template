/* oxlint-disable */
import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  currencyDisplaySchema,
  dateOrUndefinedSchema,
  e164OrUndefinedSchema,
  maskedDateStringSchema,
  numberOrUndefinedSchema,
  optionalSelectIdInputSchema,
  optionalSelectIdSchema,
  phoneDisplaySchema,
} from "@workspace/forms/v2/schema/primitives";

describe("maskedDateStringSchema", () => {
  it("accepts empty string", () => {
    expect(() => maskedDateStringSchema.parse("")).not.toThrow();
  });

  it("accepts valid date format", () => {
    expect(() => maskedDateStringSchema.parse("06/02/2026")).not.toThrow();
  });

  it("rejects invalid format", () => {
    expect(() => maskedDateStringSchema.parse("2026-02-06")).toThrow();
  });
});

describe("currencyDisplaySchema", () => {
  it("accepts any string", () => {
    expect(() => currencyDisplaySchema.parse("R$ 1.234,56")).not.toThrow();
  });
});

describe("phoneDisplaySchema", () => {
  it("accepts any string", () => {
    expect(() => phoneDisplaySchema.parse("(11) 99999-9999")).not.toThrow();
  });
});

describe("optionalSelectIdInputSchema", () => {
  it("accepts any string", () => {
    expect(() => optionalSelectIdInputSchema.parse("abc")).not.toThrow();
  });
});

describe("optionalSelectIdSchema", () => {
  it("accepts non-empty string", () => {
    expect(() => optionalSelectIdSchema.parse("abc")).not.toThrow();
  });

  it("rejects empty string", () => {
    expect(() => optionalSelectIdSchema.parse("")).toThrow();
  });
});

describe("dateOrUndefinedSchema", () => {
  it("accepts Date object", () => {
    expect(() => dateOrUndefinedSchema.parse(new Date())).not.toThrow();
  });

  it("accepts undefined", () => {
    expect(() => dateOrUndefinedSchema.parse(undefined)).not.toThrow();
  });

  it("rejects string", () => {
    expect(() => dateOrUndefinedSchema.parse("2026-02-06")).toThrow();
  });
});

describe("numberOrUndefinedSchema", () => {
  it("accepts finite number", () => {
    expect(() => numberOrUndefinedSchema.parse(123.45)).not.toThrow();
  });

  it("accepts undefined", () => {
    expect(() => numberOrUndefinedSchema.parse(undefined)).not.toThrow();
  });

  it("rejects NaN", () => {
    expect(() => numberOrUndefinedSchema.parse(NaN)).toThrow();
  });

  it("rejects Infinity", () => {
    expect(() => numberOrUndefinedSchema.parse(Infinity)).toThrow();
  });
});

describe("e164OrUndefinedSchema", () => {
  it("accepts valid E.164", () => {
    expect(() => e164OrUndefinedSchema.parse("+5511999999999")).not.toThrow();
  });

  it("accepts undefined", () => {
    expect(() => e164OrUndefinedSchema.parse(undefined)).not.toThrow();
  });

  it("rejects missing plus", () => {
    expect(() => e164OrUndefinedSchema.parse("5511999999999")).toThrow();
  });

  it("rejects too short", () => {
    expect(() => e164OrUndefinedSchema.parse("+1234567")).toThrow();
  });
});
