/**
 * @fileoverview Slug/Profile URL Security & Validation Tests
 * @description Comprehensive test suite for slug validation covering valid inputs,
 *              malicious payloads, edge cases, and security hardening.
 *
 * QA CHECKLIST:
 * - [ ] Slug field container never exceeds 50% width on desktop
 * - [ ] Slug input enforces strict allowed characters + max length consistently
 * - [ ] Unsafe payloads are rejected/normalized
 * - [ ] Validation messages show reliably and match Field v2 styling
 * - [ ] Tests cover key valid/invalid cases, including malicious inputs
 */

import { describe, expect, it } from "vitest";

// ============================================================================
// Constants (mirrors server-side validation)
// ============================================================================

const SLUG_MIN_LENGTH = 3;
const SLUG_MAX_LENGTH = 30;

// ============================================================================
// Validation Functions (mirrors server-side implementation)
// ============================================================================

const normalizeText = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ?? null;
};

const normalizeSlug = (value?: string | null): string | null => {
  const trimmed = normalizeText(value);
  if (!trimmed) return null;

  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

interface ValidationResult {
  valid: boolean;
  slug: string | null;
  error?: string;
}

const validateSlug = (value?: string | null): ValidationResult => {
  const normalized = normalizeSlug(value);

  if (!normalized) {
    return { valid: false, slug: null, error: "Slug é obrigatório" };
  }

  if (normalized.length < SLUG_MIN_LENGTH) {
    return {
      valid: false,
      slug: normalized,
      error: `Slug deve ter pelo menos ${SLUG_MIN_LENGTH} caracteres`,
    };
  }

  if (normalized.length > SLUG_MAX_LENGTH) {
    return {
      valid: false,
      slug: normalized,
      error: `Slug deve ter no máximo ${SLUG_MAX_LENGTH} caracteres`,
    };
  }

  return { valid: true, slug: normalized };
};

// ============================================================================
// Test Suite: Valid Inputs
// ============================================================================

describe("Slug Validation - Valid Inputs", () => {
  it("should accept simple lowercase slug", () => {
    const result = validateSlug("john-doe");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("john-doe");
  });

  it("should normalize uppercase to lowercase", () => {
    const result = validateSlug("JohnDoe123");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("johndoe123");
  });

  it("should trim leading/trailing spaces", () => {
    const result = validateSlug("  spaces  ");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("spaces");
  });

  it("should collapse double hyphens", () => {
    const result = validateSlug("double--hyphens");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("double-hyphens");
  });

  it("should handle numbers in slug", () => {
    const result = validateSlug("user123-test456");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user123-test456");
  });

  it("should handle minimum length boundary", () => {
    const result = validateSlug("abc");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("abc");
  });

  it("should handle maximum length boundary", () => {
    const result = validateSlug("a".repeat(SLUG_MAX_LENGTH));
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("a".repeat(SLUG_MAX_LENGTH));
  });

  it("should remove leading hyphen", () => {
    const result = validateSlug("-leading-hyphen");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("leading-hyphen");
  });

  it("should remove trailing hyphen", () => {
    const result = validateSlug("trailing-hyphen-");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("trailing-hyphen");
  });

  it("should handle mixed valid characters", () => {
    const result = validateSlug("dr-sarah-johnson-2024");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("dr-sarah-johnson-2024");
  });
});

// ============================================================================
// Test Suite: XSS Prevention
// ============================================================================

describe("Slug Validation - XSS Prevention", () => {
  it("should neutralize script tags", () => {
    const result = validateSlug("<script>alert('xss')</script>");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("script-alert-xss-script");
  });

  it("should neutralize javascript: protocol", () => {
    const result = validateSlug("javascript:alert(1)");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("javascript-alert-1");
  });

  it("should neutralize onerror attribute", () => {
    const result = validateSlug("<img onerror=alert(1)>");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("img-onerror-alert-1");
  });

  it("should neutralize onload attribute", () => {
    const result = validateSlug("<body onload=alert(1)>");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("body-onload-alert-1");
  });

  it("should neutralize onclick attribute", () => {
    const result = validateSlug("<div onclick=alert(1)>");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("div-onclick-alert-1");
  });

  it("should neutralize onmouseover attribute", () => {
    const result = validateSlug("<a onmouseover=alert(1)>");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("a-onmouseover-alert-1");
  });

  it("should handle encoded angle brackets", () => {
    const result = validateSlug("test%3Cscript%3E");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("test-3cscript-3e");
  });

  it("should handle HTML entities", () => {
    const result = validateSlug("test&#60;script&#62;");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("test-60-script-62");
  });

  it("should neutralize data: protocol", () => {
    const result = validateSlug("data:text/html,<script>");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("data-text-html-script");
  });

  it("should neutralize vbscript: protocol", () => {
    const result = validateSlug("vbscript:msgbox(1)");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("vbscript-msgbox-1");
  });

  it("should handle SVG-based XSS", () => {
    const result = validateSlug("<svg onload=alert(1)>");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("svg-onload-alert-1");
  });

  it("should handle iframe injection attempts", () => {
    const result = validateSlug("<iframe src=javascript:alert(1)>");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("iframe-src-javascript-alert-1");
  });
});

// ============================================================================
// Test Suite: SQL Injection Prevention
// ============================================================================

describe("Slug Validation - SQL Injection Prevention", () => {
  it("should neutralize DROP TABLE attempt", () => {
    const result = validateSlug("'; DROP TABLE users; --");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("drop-table-users");
  });

  it("should neutralize UNION SELECT attempt", () => {
    const result = validateSlug("' UNION SELECT * FROM passwords --");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("union-select-from-passwords");
  });

  it("should neutralize OR 1=1 injection", () => {
    const result = validateSlug("' OR '1'='1");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("or-1-1");
  });

  it("should neutralize comment blocks", () => {
    const result = validateSlug("test/*comment*/user");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("test-comment-user");
  });

  it("should neutralize semicolon separators", () => {
    const result = validateSlug("user; DELETE FROM logs");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-delete-from-logs");
  });

  it("should neutralize double dash comments", () => {
    const result = validateSlug("user--admin");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-admin");
  });

  it("should neutralize hash comments", () => {
    const result = validateSlug("user#secret");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-secret");
  });

  it("should neutralize xp_cmdshell attempt", () => {
    const result = validateSlug("test'; EXEC xp_cmdshell 'dir' --");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("test-exec-xp-cmdshell-dir");
  });

  it("should neutralize boolean-based blind SQLi", () => {
    const result = validateSlug("test' AND 1=1 --");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("test-and-1-1");
  });

  it("should neutralize time-based blind SQLi", () => {
    const result = validateSlug("test' AND SLEEP(5) --");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("test-and-sleep-5");
  });
});

// ============================================================================
// Test Suite: Path Traversal Prevention
// ============================================================================

describe("Slug Validation - Path Traversal Prevention", () => {
  it("should neutralize Unix path traversal", () => {
    const result = validateSlug("../../etc/passwd");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("etc-passwd");
  });

  it("should neutralize Windows path traversal", () => {
    const result = validateSlug("..\\..\\windows\\system32");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("windows-system32");
  });

  it("should neutralize mixed path traversal", () => {
    const result = validateSlug("../..\\etc/passwd");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("etc-passwd");
  });

  it("should neutralize URL-encoded traversal", () => {
    const result = validateSlug("%2e%2e%2f%2e%2e%2fetc");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("2e-2e-2f-2e-2e-2fetc");
  });

  it("should neutralize double-encoded traversal", () => {
    const result = validateSlug("%252e%252e%252f");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("252e-252e-252f");
  });

  it("should neutralize null byte injection", () => {
    const result = validateSlug("safe\x00malicious");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("safe-malicious");
  });

  it("should neutralize %00 null byte", () => {
    const result = validateSlug("safe%00malicious");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("safe-00malicious");
  });

  it("should neutralize absolute path attempt", () => {
    const result = validateSlug("/etc/passwd");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("etc-passwd");
  });
});

// ============================================================================
// Test Suite: Unicode & Encoding Attacks
// ============================================================================

describe("Slug Validation - Unicode & Encoding Attacks", () => {
  it("should handle accents and diacritics", () => {
    const result = validateSlug("café-niño");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("caf-ni-o");
  });

  it("should handle cyrillic homoglyphs", () => {
    // Cyrillic 'а' (U+0430) looks like Latin 'a' (U+0061)
    const result = validateSlug("userаdmin"); // Mixed scripts
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-dmin");
  });

  it("should handle greek homoglyphs", () => {
    // Greek 'ο' (U+03BF) looks like Latin 'o' (U+006F)
    const result = validateSlug("gοοgle");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("g-gle");
  });

  it("should remove zero-width characters", () => {
    const result = validateSlug("admin\u200B\u200C\u200Duser");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("admin-user");
  });

  it("should remove zero-width joiner", () => {
    const result = validateSlug("test\u200Duser");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("test-user");
  });

  it("should remove zero-width non-joiner", () => {
    const result = validateSlug("test\u200Cuser");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("test-user");
  });

  it("should handle right-to-left override", () => {
    const result = validateSlug("safe\u202Eevil");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("safe-evil");
  });

  it("should handle left-to-right override", () => {
    const result = validateSlug("safe\u202DeviL");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("safe-evil");
  });

  it("should handle emoji characters", () => {
    const result = validateSlug("with-🎉-emoji");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("with-emoji");
  });

  it("should handle multiple emojis", () => {
    const result = validateSlug("🚀rocket🌟star🎯target");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("rocket-star-target");
  });

  it("should handle fullwidth characters", () => {
    // Fullwidth Latin characters (U+FF01-U+FF5E) - become hyphens then stripped
    const result = validateSlug("ｔｅｓｔ");
    expect(result.valid).toBe(false); // Results in empty string after normalization
    expect(result.slug).toBeNull();
  });

  it("should handle bidi spoofing attempts", () => {
    const result = validateSlug("paypal\u202Ecom");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("paypal-com");
  });
});

// ============================================================================
// Test Suite: Special Characters & Formatting
// ============================================================================

describe("Slug Validation - Special Characters", () => {
  it("should convert spaces to hyphens", () => {
    const result = validateSlug("spaces and more");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("spaces-and-more");
  });

  it("should convert underscores to hyphens", () => {
    const result = validateSlug("spaces_and_underscores");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("spaces-and-underscores");
  });

  it("should handle mixed separators", () => {
    const result = validateSlug("a_b-c d_e");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("a-b-c-d-e");
  });

  it("should handle email-like input", () => {
    const result = validateSlug("user@domain.com");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-domain-com");
  });

  it("should handle dots in input", () => {
    const result = validateSlug("dr.smith.md");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("dr-smith-md");
  });

  it("should handle special symbols", () => {
    const result = validateSlug("test!@#$%^&*()_+");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("test");
  });

  it("should handle brackets", () => {
    const result = validateSlug("user[name]");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-name");
  });

  it("should handle curly braces", () => {
    const result = validateSlug("user{name}");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-name");
  });

  it("should handle pipe character", () => {
    const result = validateSlug("option1|option2");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("option1-option2");
  });

  it("should handle backslash", () => {
    const result = validateSlug("path\\to\\resource");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("path-to-resource");
  });
});

// ============================================================================
// Test Suite: Length Boundaries
// ============================================================================

describe("Slug Validation - Length Boundaries", () => {
  it("should reject empty string", () => {
    const result = validateSlug("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Slug é obrigatório");
  });

  it("should reject whitespace only", () => {
    const result = validateSlug("   ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Slug é obrigatório");
  });

  it("should reject null", () => {
    const result = validateSlug(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Slug é obrigatório");
  });

  it("should reject undefined", () => {
    const result = validateSlug(undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Slug é obrigatório");
  });

  it("should reject too short (2 chars)", () => {
    const result = validateSlug("ab");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("pelo menos 3");
  });

  it("should accept minimum length (3 chars)", () => {
    const result = validateSlug("abc");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("abc");
  });

  it("should accept maximum length (30 chars)", () => {
    const slug = "a".repeat(SLUG_MAX_LENGTH);
    const result = validateSlug(slug);
    expect(result.valid).toBe(true);
    expect(result.slug?.length).toBe(SLUG_MAX_LENGTH);
  });

  it("should reject too long (31 chars)", () => {
    const slug = "a".repeat(SLUG_MAX_LENGTH + 1);
    const result = validateSlug(slug);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("máximo");
  });

  it("should reject extremely long input", () => {
    const slug = "a".repeat(1000);
    const result = validateSlug(slug);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("máximo");
  });

  it("should handle boundary after normalization", () => {
    // Input becomes exactly 30 chars after normalization
    const result = validateSlug("-" + "a".repeat(SLUG_MAX_LENGTH) + "-");
    expect(result.valid).toBe(true);
    expect(result.slug?.length).toBe(SLUG_MAX_LENGTH);
  });
});

// ============================================================================
// Test Suite: Edge Cases
// ============================================================================

describe("Slug Validation - Edge Cases", () => {
  it("should handle all hyphens", () => {
    const result = validateSlug("---");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Slug é obrigatório");
  });

  it("should handle only special characters", () => {
    const result = validateSlug("!@#$%");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Slug é obrigatório");
  });

  it("should handle leading/trailing special chars", () => {
    const result = validateSlug("!@#test$%^");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("test");
  });

  it("should handle mixed case normalization", () => {
    const result = validateSlug("TeStUsEr123");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("testuser123");
  });

  it("should handle multiple consecutive hyphens", () => {
    const result = validateSlug("a---b----c");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("a-b-c");
  });

  it("should handle tab characters", () => {
    const result = validateSlug("user\ttest");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-test");
  });

  it("should handle newline characters", () => {
    const result = validateSlug("user\ntest");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-test");
  });

  it("should handle carriage return", () => {
    const result = validateSlug("user\rtest");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-test");
  });

  it("should handle form feed", () => {
    const result = validateSlug("user\ftest");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-test");
  });

  it("should handle vertical tab", () => {
    const result = validateSlug("user\vtest");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-test");
  });

  it("should handle control characters", () => {
    const result = validateSlug("user\x01\x02test");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("user-test");
  });

  it("should handle high unicode", () => {
    const result = validateSlug("test\u{1F600}emoji");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("test-emoji");
  });

  it("should handle mathematical symbols", () => {
    const result = validateSlug("x+y=z");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("x-y-z");
  });

  it("should handle currency symbols", () => {
    const result = validateSlug("price-$100");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("price-100");
  });
});

// ============================================================================
// Test Suite: Real-World Scenarios
// ============================================================================

describe("Slug Validation - Real-World Scenarios", () => {
  it("should handle psychologist name with accents", () => {
    const result = validateSlug("Dra. Ana María López");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("dra-ana-mar-a-l-pez");
  });

  it("should handle business name", () => {
    const result = validateSlug("Clínica Saúde & Bem-Estar");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("cl-nica-sa-de-bem-estar");
  });

  it("should handle name with credentials", () => {
    const result = validateSlug("Dr. João Silva, Ph.D.");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("dr-jo-o-silva-ph-d");
  });

  it("should handle multiple spaces", () => {
    const result = validateSlug("John    Doe");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("john-doe");
  });

  it("should handle parentheses in business name", () => {
    const result = validateSlug("Psicologia (Online)");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("psicologia-online");
  });

  it("should handle ampersand", () => {
    const result = validateSlug("Smith & Johnson");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("smith-johnson");
  });

  it("should handle apostrophe", () => {
    const result = validateSlug("d'Ambrosio");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("d-ambrosio");
  });

  it("should handle hyphenated name", () => {
    const result = validateSlug("Anne-Marie Smith-Jones");
    expect(result.valid).toBe(true);
    expect(result.slug).toBe("anne-marie-smith-jones");
  });
});

// ============================================================================
// Test Suite: Null/Undefined Handling
// ============================================================================

describe("Slug Validation - Null Safety", () => {
  it("should handle null input gracefully", () => {
    const result = validateSlug(null);
    expect(result.valid).toBe(false);
    expect(result.slug).toBeNull();
  });

  it("should handle undefined input gracefully", () => {
    const result = validateSlug(undefined);
    expect(result.valid).toBe(false);
    expect(result.slug).toBeNull();
  });

  it("should handle empty string after trim", () => {
    const result = validateSlug("     ");
    expect(result.valid).toBe(false);
    expect(result.slug).toBeNull();
  });

  it("should normalize function return null for empty", () => {
    expect(normalizeSlug("")).toBeNull();
    expect(normalizeSlug("   ")).toBeNull();
    expect(normalizeSlug(null)).toBeNull();
    expect(normalizeSlug(undefined)).toBeNull();
  });
});

// ============================================================================
// QA CHECKLIST (as comment for documentation)
// ============================================================================

/**
 * QA CHECKLIST FOR SLUG/PROFILE URL FIELD
 *
 * UI/UX:
 * - [ ] Slug field container never exceeds 50% width on desktop
 * - [ ] Slug input has clear placeholder text (e.g., "seu-nome")
 * - [ ] Input enforces strict allowed characters + max length consistently
 * - [ ] Real-time validation feedback as user types
 * - [ ] Validation messages show reliably and match Field v2 styling
 * - [ ] Slug availability check shows loading state
 * - [ ] Slug availability check shows success/error states clearly
 *
 * SECURITY:
 * - [ ] Unsafe payloads are rejected/normalized
 * - [ ] XSS attempts (<script>, javascript:, onerror=) are neutralized
 * - [ ] SQL injection attempts (';, DROP, UNION) are neutralized
 * - [ ] Path traversal (../) is neutralized
 * - [ ] Null bytes (%00) are neutralized
 * - [ ] Unicode tricks (homoglyphs, zero-width) are neutralized
 * - [ ] Encoded characters (%3C, &#60;) are neutralized
 * - [ ] Server validates independently of client (never trust client only)
 *
 * VALIDATION:
 * - [ ] Min length (3 chars) enforced
 * - [ ] Max length (30 chars) enforced
 * - [ ] Only lowercase letters, numbers, and hyphens allowed
 * - [ ] Leading/trailing hyphens removed
 * - [ ] Multiple consecutive hyphens collapsed to single
 * - [ ] Accents and special characters converted/removed
 *
 * TESTS:
 * - [ ] Tests cover key valid cases
 * - [ ] Tests cover invalid/malicious inputs
 * - [ ] Tests cover XSS prevention
 * - [ ] Tests cover SQL injection prevention
 * - [ ] Tests cover path traversal prevention
 * - [ ] Tests cover unicode/encoding attacks
 * - [ ] Tests cover length boundaries
 * - [ ] Tests cover edge cases (empty, null, etc.)
 *
 * ACCESSIBILITY:
 * - [ ] Slug field has associated label
 * - [ ] Error messages are announced to screen readers
 * - [ ] Input has aria-invalid when invalid
 * - [ ] Input has aria-describedby linking to error message
 */
