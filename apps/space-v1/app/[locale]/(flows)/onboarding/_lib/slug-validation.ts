// Re-export from @workspace/ui for shared usage
// This file exists for backward compatibility with existing imports

export {
  isValidSlugCharacter,
  normalizeSlug,
  sanitizeSlugInput,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  type SlugValidationResult,
  validateSlug,
} from "@workspace/ui/lib/slug-validation";
