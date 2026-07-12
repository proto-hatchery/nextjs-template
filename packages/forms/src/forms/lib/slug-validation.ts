export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 30;

const VALID_SLUG_REGEX = /^[a-z0-9-]+$/;
const LEADING_HYPHEN_REGEX = /^-/;
const TRAILING_HYPHEN_REGEX = /-$/;
const REPEATED_HYPHENS_REGEX = /--/;

export interface SlugValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateSlug(value: string): SlugValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, error: "URL é obrigatória." };
  }

  if (!VALID_SLUG_REGEX.test(trimmed)) {
    return { valid: false, error: "Use apenas letras minúsculas, números e hífen." };
  }

  if (LEADING_HYPHEN_REGEX.test(trimmed) || TRAILING_HYPHEN_REGEX.test(trimmed)) {
    return { valid: false, error: "URL não pode começar ou terminar com hífen." };
  }

  if (REPEATED_HYPHENS_REGEX.test(trimmed)) {
    return { valid: false, error: "URL não pode ter hífens repetidos." };
  }

  if (trimmed.length < SLUG_MIN_LENGTH) {
    return { valid: false, error: "Use ao menos 3 caracteres." };
  }

  if (trimmed.length > SLUG_MAX_LENGTH) {
    return { valid: false, error: "URL deve ter no máximo 30 caracteres." };
  }

  return { valid: true, error: null };
}

export function normalizeSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, SLUG_MAX_LENGTH);
}

export function isValidSlugCharacter(char: string): boolean {
  return /^[a-zA-Z0-9-]$/.test(char);
}

export function sanitizeSlugInput(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .toLowerCase();
}
