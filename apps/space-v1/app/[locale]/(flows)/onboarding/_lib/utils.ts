// Local utilities for personal website onboarding
// Re-exports from @workspace/ui/lib/linktree-links for consistency

import type { EssentialLinkKey, FluriLink } from "@workspace/ui/lib/linktree-links";
import {
  buildEssentialLinktreeLinks as _buildEssentialLinktreeLinks,
  mergeEssentialLinks as _mergeEssentialLinks,
  normalizeLinktreeSlug as _normalizeLinktreeSlug,
} from "@workspace/ui/lib/linktree-links";

import { normalizeSlug, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from "./slug-validation";

// Re-export slug validation
export { normalizeSlug, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH };

// Re-export from @workspace/ui for consistency
export {
  buildDefaultLinks,
  buildWhatsAppUrl,
  type EssentialLinkKey,
  type FluriLink as Link,
  mapLinktreeLinks,
  normalizeSocialLinks,
  type FluriSocialLinks as SocialLinks,
  toApiLinks,
  updateLinksWithSlug,
} from "@workspace/ui/lib/linktree-links";

/**
 * @deprecated Use from @workspace/ui/lib/linktree-links instead
 * Kept for backward compatibility
 */
export function normalizeLinktreeSlug(value: string): string {
  return _normalizeLinktreeSlug(value);
}

/**
 * @deprecated Use from @workspace/ui/lib/linktree-links instead
 * Kept for backward compatibility
 */
export function buildEssentialLinktreeLinks(
  linktreeSlug: string,
  phone?: string | null,
): Record<EssentialLinkKey, FluriLink> {
  return _buildEssentialLinktreeLinks(linktreeSlug, phone);
}

/**
 * @deprecated Use from @workspace/ui/lib/linktree-links instead
 * Kept for backward compatibility
 */
export function mergeEssentialLinks(
  existingLinks: FluriLink[],
  linktreeSlug: string,
  phone?: string | null,
): Record<EssentialLinkKey, FluriLink> {
  return _mergeEssentialLinks(existingLinks, linktreeSlug, phone);
}
