"use client";

import { FluriFieldLinksV2 } from "@workspace/forms/components/specialized/v2/fluri-field-links-v2";
import type { FluriLink } from "@workspace/ui/lib/linktree-links";
import { useEffect, useState } from "react";

import { buildEssentialLinktreeLinks, mergeEssentialLinks } from "../../_lib/utils";

interface Step2LinksProps {
  slug: string;
  links: FluriLink[];
  phone: string | null | undefined;
  onChange: (links: FluriLink[]) => void;
}

/**
 * Initialize links with proper essential link defaults
 * Uses the psychologist's phone number for WhatsApp link
 */
function initializeLinks(links: FluriLink[], slug: string, phone?: string | null): FluriLink[] {
  if (links.length === 0) {
    // No links yet - build defaults from scratch with phone
    const defaults = buildEssentialLinktreeLinks(slug, phone);
    return [defaults.schedule, defaults.about, defaults.whatsapp].filter(
      (l): l is FluriLink => l !== undefined,
    );
  }

  // Merge existing links with defaults (passing phone for new WhatsApp link)
  const merged = mergeEssentialLinks(links, slug, phone);

  // Filter out any existing essential links from the original array
  const nonEssential = links.filter((link) => {
    const url = link.url.toLowerCase();
    const title = link.title.toLowerCase();
    const isWhatsapp = url.includes("wa.me") || title.includes("whatsapp");
    const isSchedule = url.includes("/agendar") || title.includes("agendar");
    const isAbout = url.includes("/sobre") || title.includes("sobre");
    return !isWhatsapp && !isSchedule && !isAbout;
  });

  return [merged.schedule, merged.about, merged.whatsapp, ...nonEssential].filter(
    (l): l is FluriLink => l !== undefined,
  );
}

export function Step2Links({ slug, links, phone, onChange }: Step2LinksProps) {
  const [initializedLinks, setInitializedLinks] = useState<FluriLink[]>(() =>
    initializeLinks(links, slug, phone),
  );

  // Sync with parent when links change externally or phone changes
  useEffect(() => {
    if (links.length === 0) {
      setInitializedLinks(initializeLinks([], slug, phone));
    }
  }, [links.length, slug, phone]);

  // Notify parent of changes
  const handleChange = (newLinks: FluriLink[]) => {
    setInitializedLinks(newLinks);
    onChange(newLinks);
  };

  return (
    <div className="space-y-4">
      <FluriFieldLinksV2
        links={initializedLinks}
        onChange={handleChange}
        maxActiveLinks={4}
        allowAdd={false}
        allowRemove={true}
        allowReorder={true}
        showActiveToggle={true}
        titlePlaceholder="Título do link"
        urlPlaceholder="https://..."
        helperText="Ative os links que deseja exibir no seu perfil. Você pode editar os URLs e adicionar mais links na página de Links após o onboarding."
      />
    </div>
  );
}
