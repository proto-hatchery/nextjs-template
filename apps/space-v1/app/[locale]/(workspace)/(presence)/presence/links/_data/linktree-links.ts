// Re-exports from @workspace/ui/lib/linktree-links for shared consistency
// Local extensions for linktree-specific functionality

export type {
  EssentialLinkKey,
  FluriLink as Link,
  FluriSocialLinks as SocialLinks,
} from "@workspace/ui/lib/linktree-links";
export {
  buildDefaultLinks,
  buildEssentialLinktreeLinks,
  buildWhatsAppUrl,
  mapLinktreeLinks,
  mergeEssentialLinks,
  normalizeLinktreeSlug,
  normalizeSocialLinks,
  updateLinksWithSlug,
} from "@workspace/ui/lib/linktree-links";
