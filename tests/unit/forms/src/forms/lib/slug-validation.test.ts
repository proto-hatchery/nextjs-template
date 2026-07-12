/* oxlint-disable */
import { describe, expect, it } from "vitest";

import {
  isValidSlugCharacter,
  normalizeSlug,
  sanitizeSlugInput,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  validateSlug,
} from "@workspace/forms/lib/slug-validation";

describe("validateSlug", () => {
  it("accepts valid slug", () => {
    const result = validateSlug("my-slug");
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it("rejects empty string", () => {
    const result = validateSlug("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("URL é obrigatória.");
  });

  it("rejects whitespace-only string", () => {
    const result = validateSlug("   ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("URL é obrigatória.");
  });

  it("rejects invalid characters", () => {
    const result = validateSlug("my_slug");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Use apenas letras minúsculas, números e hífen.");
  });

  it("rejects leading hyphen", () => {
    const result = validateSlug("-slug");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("URL não pode começar ou terminar com hífen.");
  });

  it("rejects trailing hyphen", () => {
    const result = validateSlug("slug-");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("URL não pode começar ou terminar com hífen.");
  });

  it("rejects repeated hyphens", () => {
    const result = validateSlug("my--slug");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("URL não pode ter hífens repetidos.");
  });

  it("rejects too short slug", () => {
    const result = validateSlug("ab");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Use ao menos 3 caracteres.");
  });

  it("rejects too long slug", () => {
    const result = validateSlug("a".repeat(SLUG_MAX_LENGTH + 1));
    expect(result.valid).toBe(false);
    expect(result.error).toBe("URL deve ter no máximo 30 caracteres.");
  });

  it("accepts minimum length", () => {
    const result = validateSlug("abc");
    expect(result.valid).toBe(true);
  });

  it("accepts maximum length", () => {
    const result = validateSlug("a".repeat(SLUG_MAX_LENGTH));
    expect(result.valid).toBe(true);
  });
});

describe("normalizeSlug", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(normalizeSlug("My Slug")).toBe("my-slug");
  });

  it("removes accents", () => {
    expect(normalizeSlug("sãopaulo")).toBe("saopaulo");
  });

  it("removes leading and trailing hyphens", () => {
    expect(normalizeSlug("-slug-")).toBe("slug");
  });

  it("collapses multiple hyphens", () => {
    expect(normalizeSlug("my---slug")).toBe("my-slug");
  });

  it("truncates to max length", () => {
    expect(normalizeSlug("a".repeat(50)).length).toBe(SLUG_MAX_LENGTH);
  });
});

describe("isValidSlugCharacter", () => {
  it("accepts lowercase letters", () => {
    expect(isValidSlugCharacter("a")).toBe(true);
  });

  it("accepts uppercase letters", () => {
    expect(isValidSlugCharacter("A")).toBe(true);
  });

  it("accepts digits", () => {
    expect(isValidSlugCharacter("1")).toBe(true);
  });

  it("accepts hyphen", () => {
    expect(isValidSlugCharacter("-")).toBe(true);
  });

  it("rejects underscore", () => {
    expect(isValidSlugCharacter("_")).toBe(false);
  });

  it("rejects space", () => {
    expect(isValidSlugCharacter(" ")).toBe(false);
  });
});

describe("sanitizeSlugInput", () => {
  it("removes invalid characters", () => {
    expect(sanitizeSlugInput("my_slug")).toBe("myslug");
  });

  it("removes accents", () => {
    expect(sanitizeSlugInput("são")).toBe("sao");
  });

  it("lowercases", () => {
    expect(sanitizeSlugInput("MySlug")).toBe("myslug");
  });

  it("truncates to max length", () => {
    expect(sanitizeSlugInput("a".repeat(50)).length).toBe(SLUG_MAX_LENGTH);
  });
});
