// Shared types and utilities for linktree/links functionality
// Used across apps (onboarding, personal-website) and packages

export interface FluriSocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  spotify?: string;
  linkedin?: string;
}

export interface FluriLink {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

export type EssentialLinkKey = "schedule" | "about" | "whatsapp";

export const WHATSAPP_PHONE_PLACEHOLDER = "SEU_NUMERO";

/**
 * Normalize social links from unknown value
 */
export function normalizeSocialLinks(value: unknown): FluriSocialLinks {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, string | undefined | null>;
  return {
    ...(raw.instagram ? { instagram: raw.instagram } : {}),
    ...(raw.tiktok ? { tiktok: raw.tiktok } : {}),
    ...(raw.youtube ? { youtube: raw.youtube } : {}),
    ...(raw.twitter ? { twitter: raw.twitter } : {}),
    ...(raw.spotify ? { spotify: raw.spotify } : {}),
    ...(raw.linkedin ? { linkedin: raw.linkedin } : {}),
  };
}

/**
 * Normalize a linktree slug (lowercase, hyphens only)
 */
export function normalizeLinktreeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Build WhatsApp URL with just the phone number (no message)
 * Uses the psychologist's phone number if available
 */
export function buildWhatsAppUrl(phone?: string | null): string {
  return `https://wa.me/${normalizeWhatsAppPhoneDigits(phone) ?? WHATSAPP_PHONE_PLACEHOLDER}`;
}

export function normalizeWhatsAppPhoneDigits(phone?: string | null): string | null {
  const digits = phone?.replace(/\D/g, "") ?? "";

  if (!digits || digits === "55" || digits.length < 10) {
    return null;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

function extractWhatsAppPhoneCandidate(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname === "wa.me" || hostname.endsWith(".wa.me")) {
      return decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, "").split("/")[0] ?? "");
    }

    if (hostname.endsWith("whatsapp.com")) {
      return parsedUrl.searchParams.get("phone");
    }
  } catch {
    const match = url.match(/wa\.me\/([^/?#]+)/i);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  }

  return null;
}

export function isIncompleteWhatsAppUrl(url: string): boolean {
  const normalizedUrl = url.toLowerCase();

  if (!normalizedUrl.includes("wa.me") && !normalizedUrl.includes("whatsapp.com")) {
    return false;
  }

  const candidate = extractWhatsAppPhoneCandidate(url);
  if (!candidate || candidate.toUpperCase() === WHATSAPP_PHONE_PLACEHOLDER) {
    return true;
  }

  return normalizeWhatsAppPhoneDigits(candidate) === null;
}

/**
 * Build default essential links for a given slug
 * @param linktreeSlug - The profile slug
 * @param phone - Optional psychologist phone number for WhatsApp link
 */
export function buildEssentialLinktreeLinks(
  linktreeSlug: string,
  phone?: string | null,
): Record<EssentialLinkKey, FluriLink> {
  const slug = normalizeLinktreeSlug(linktreeSlug) || "seu-usuario";
  const whatsappPhone = normalizeWhatsAppPhoneDigits(phone);

  return {
    schedule: {
      id: crypto.randomUUID(),
      title: "Agendar Sessão",
      url: `https://me.fluri.com.br/${slug}/agendar`,
      active: true,
    },
    about: {
      id: crypto.randomUUID(),
      title: "Sobre Mim",
      url: `https://me.fluri.com.br/${slug}/sobre`,
      active: true,
    },
    whatsapp: {
      id: crypto.randomUUID(),
      title: whatsappPhone ? "WhatsApp" : "WhatsApp (adicione seu número)",
      url: buildWhatsAppUrl(phone),
      active: Boolean(whatsappPhone),
    },
  };
}

/**
 * Detect if a link is an essential link based on title/URL
 */
function detectEssentialKey(link: Pick<FluriLink, "title" | "url">): EssentialLinkKey | null {
  const title = link.title.toLowerCase();
  const url = link.url.toLowerCase();

  if (url.includes("wa.me") || title.includes("whatsapp")) return "whatsapp";
  if (url.includes("/agendar") || title.includes("agendar")) return "schedule";
  if (url.includes("/sobre") || title.includes("sobre")) return "about";
  return null;
}

/**
 * Merge existing links with essential link defaults
 * @param existingLinks - Existing links to merge
 * @param linktreeSlug - The profile slug
 * @param phone - Optional psychologist phone number for WhatsApp link
 */
export function mergeEssentialLinks(
  existingLinks: FluriLink[],
  linktreeSlug: string,
  phone?: string | null,
): Record<EssentialLinkKey, FluriLink> {
  const defaults = buildEssentialLinktreeLinks(linktreeSlug, phone);

  for (const link of existingLinks) {
    const key = detectEssentialKey(link);
    if (!key) continue;
    if (key === "whatsapp" && isIncompleteWhatsAppUrl(link.url)) {
      defaults.whatsapp = {
        ...defaults.whatsapp,
        id: link.id,
      };
      continue;
    }
    defaults[key] = link;
  }

  return defaults;
}

export function mergeEssentialLinktreeLinksList(
  existingLinks: FluriLink[],
  linktreeSlug: string,
  phone?: string | null,
): FluriLink[] {
  const merged = mergeEssentialLinks(existingLinks, linktreeSlug, phone);
  const nonEssentialLinks = existingLinks.filter((link) => detectEssentialKey(link) === null);

  return [merged.schedule, merged.about, merged.whatsapp, ...nonEssentialLinks];
}

/**
 * Build default links array (just the essentials)
 * @param linktreeSlug - The profile slug
 * @param phone - Optional psychologist phone number for WhatsApp link
 */
export function buildDefaultLinks(linktreeSlug: string, phone?: string | null): FluriLink[] {
  return mergeEssentialLinktreeLinksList([], linktreeSlug, phone);
}

/**
 * Map linktree links from API format to FluriLink format
 */
export function mapLinktreeLinks(
  linktreeLinks: { id: string; title: string; url: string; is_active: boolean }[] | null,
): FluriLink[] | null {
  if (!linktreeLinks || linktreeLinks.length === 0) return null;
  return linktreeLinks.map((link) => ({
    id: link.id,
    title: link.title,
    url: link.url,
    active: link.is_active,
  }));
}

/**
 * Update links with a new slug (updates URLs containing me.fluri.com.br)
 */
export function updateLinksWithSlug(links: FluriLink[], nextSlug: string): FluriLink[] {
  const normalizedSlug = normalizeLinktreeSlug(nextSlug);

  return links.map((link) => {
    if (link.url.includes("me.fluri.com.br/")) {
      const parts = link.url.split("me.fluri.com.br/");
      if (parts.length === 2) {
        const pathPart = parts[1];
        if (!pathPart) return link;
        const pathParts = pathPart.split("/");
        const remainingPath = pathParts.slice(1).join("/");
        return {
          ...link,
          url: `https://me.fluri.com.br/${normalizedSlug}${
            remainingPath ? `/${remainingPath}` : ""
          }`,
        };
      }
    }
    return link;
  });
}

/**
 * Convert FluriLink array to API format
 */
export function toApiLinks(links: FluriLink[]): {
  id: string;
  title: string;
  url: string;
  is_active: boolean;
}[] {
  return links.map((link, index) => ({
    id: link.id,
    title: link.title,
    url: link.url,
    is_active: link.active,
    sortOrder: index,
  }));
}
