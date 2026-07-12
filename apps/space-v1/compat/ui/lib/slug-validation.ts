// Shared slug validation logic for profile URLs
// Used by both client and server for consistent validation

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 30;

// Allowed characters: a-z, 0-9, and hyphen only
const VALID_SLUG_REGEX = /^[a-z0-9-]+$/;

// Check for leading or trailing hyphens
const LEADING_HYPHEN_REGEX = /^-/;
const TRAILING_HYPHEN_REGEX = /-$/;

// Check for repeated hyphens
const REPEATED_HYPHENS_REGEX = /--/;

export interface SlugValidationResult {
  valid: boolean;
  error: string | null;
}

/**
 * Validates a slug value and returns specific error messages.
 * Does NOT normalize - validates the raw input.
 */
export function validateSlug(value: string): SlugValidationResult {
  const trimmed = value.trim();

  // Empty check
  if (!trimmed) {
    return { valid: false, error: "URL é obrigatória." };
  }

  // Check for invalid characters (anything that's not a-z, 0-9, or hyphen)
  // This catches spaces, underscores, accents, uppercase, special chars
  if (!VALID_SLUG_REGEX.test(trimmed)) {
    return { valid: false, error: "Use apenas letras minúsculas, números e hífen." };
  }

  // Check for leading hyphen
  if (LEADING_HYPHEN_REGEX.test(trimmed)) {
    return { valid: false, error: "URL não pode começar ou terminar com hífen." };
  }

  // Check for trailing hyphen
  if (TRAILING_HYPHEN_REGEX.test(trimmed)) {
    return { valid: false, error: "URL não pode começar ou terminar com hífen." };
  }

  // Check for repeated hyphens (should be collapsed by normalization, but good to catch)
  if (REPEATED_HYPHENS_REGEX.test(trimmed)) {
    return { valid: false, error: "URL não pode ter hífens repetidos." };
  }

  // Min length check
  if (trimmed.length < SLUG_MIN_LENGTH) {
    return { valid: false, error: "Use ao menos 3 caracteres." };
  }

  // Max length check
  if (trimmed.length > SLUG_MAX_LENGTH) {
    return { valid: false, error: "URL deve ter no máximo 30 caracteres." };
  }

  return { valid: true, error: null };
}

/**
 * Normalizes a slug value by:
 * - Trimming whitespace
 * - Converting to lowercase
 * - Removing accents/diacritics
 * - Replacing invalid characters (spaces, underscores, special chars) with hyphens
 * - Collapsing repeated hyphens
 * - Removing leading/trailing hyphens
 * - Enforcing max length
 */
export function normalizeSlug(value: string): string {
  return (
    value
      // Remove accents/diacritics (NFD decomposition + remove combining marks)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Basic normalization
      .trim()
      .toLowerCase()
      // Replace invalid characters (anything that's not a-z, 0-9, or hyphen) with hyphen
      .replace(/[^a-z0-9-]/g, "-")
      // Collapse repeated hyphens to single
      .replace(/-+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, "")
      // Enforce max length
      .slice(0, SLUG_MAX_LENGTH)
  );
}

/**
 * Quick check if a character is valid for slug input.
 * Useful for preventing invalid characters from being entered.
 */
export function isValidSlugCharacter(char: string): boolean {
  return /^[a-zA-Z0-9-]$/.test(char);
}

/**
 * Sanitizes input in real-time by only allowing valid slug characters.
 * This is a lighter version for on-the-fly input handling.
 */
export function sanitizeSlugInput(value: string): string {
  return (
    value
      // Remove accents/diacritics
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Only allow valid characters
      .replace(/[^a-zA-Z0-9-]/g, "")
      // Enforce max length during typing
      .slice(0, SLUG_MAX_LENGTH)
      .toLowerCase()
  );
}
