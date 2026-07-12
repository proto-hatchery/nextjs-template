"use client";

import { FluriSortableLinkItem } from "@workspace/forms/components/specialized/v2/fluri-sortable-link-item";
import type { LinktreeTheme } from "@/compat/supabase/utils/linktree-themes";
import { LINKTREE_THEMES } from "@/compat/supabase/utils/linktree-themes";
import { FluriLogo } from "@workspace/brand/components/fluri-logo";
import {
  arrayMove,
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  SortableContext,
  sortableKeyboardCoordinates,
  useSensor,
  useSensors,
  verticalListSortingStrategy,
} from "@workspace/forms/dnd";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Plus, User } from "lucide-react";
import { useState } from "react";

import { LinktreeHeader } from "../../_components/linktree-header";

interface Link {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  spotify?: string;
  linkedin?: string;
}

interface LinksEditorProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  /** Linktree slug: public URL segment (e.g.: me.fluri.com.br/[slug]/schedule) */
  linktreeSlug: string;
  setLinktreeSlug: (val: string) => void;
  onSlugBlur?: () => void;
  slugError?: string | null;
  isCheckingSlug?: boolean;
  tagline: string;
  setTagline: (val: string) => void;
  avatarUrl?: string;
  setAvatarUrl: (val: string | undefined) => void;
  avatarPath?: string;
  setAvatarPath: (val: string | undefined) => void;
  backgroundImageUrl?: string;
  setBackgroundImageUrl: (val: string | undefined) => void;
  backgroundImagePath?: string;
  setBackgroundImagePath: (val: string | undefined) => void;
  themeId: string;
  setThemeId: (val: string) => void;
  links: Link[];
  setLinks: (links: Link[] | ((items: Link[]) => Link[])) => void;
  socials: SocialLinks;
  setSocials: (socials: SocialLinks) => void;
  onAddEssentialLinks?: () => void;
  onResetEssentialLinks?: () => void;
  onAvatarUpload?: (croppedImage: string) => Promise<{ url: string; path?: string } | null>;
  onBackgroundUpload?: (croppedImage: string) => Promise<{ url: string; path?: string } | null>;
}

export function LinksEditor({
  displayName,
  setDisplayName,
  linktreeSlug,
  setLinktreeSlug,
  onSlugBlur,
  slugError,
  isCheckingSlug,
  tagline,
  setTagline,
  avatarUrl,
  setAvatarUrl,
  avatarPath,
  setAvatarPath,
  backgroundImageUrl,
  setBackgroundImageUrl,
  backgroundImagePath,
  setBackgroundImagePath,
  themeId,
  setThemeId,
  links,
  setLinks,
  socials,
  setSocials,
  onAddEssentialLinks,
  onResetEssentialLinks,
  onAvatarUpload,
  onBackgroundUpload,
}: LinksEditorProps) {
  const [linksError, setLinksError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addLink = () => {
    const activeCount = links.filter((link) => link.active).length;
    const canActivate = activeCount < 4;
    const newLink: Link = {
      id: crypto.randomUUID(),
      title: "Novo Link",
      url: "https://",
      active: canActivate,
    };
    setLinks([...links, newLink]);
    if (!canActivate) {
      setLinksError("Limite de 4 links ativos. Desative um para ativar outro.");
    } else {
      setLinksError(null);
    }
  };

  const updateLink = (id: string, updates: Partial<Link>) => {
    setLinks(links.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
    setLinksError(null);
  };

  const _toggleLinkActive = (id: string, nextActive: boolean): void => {
    if (!nextActive) {
      setLinksError(null);
      updateLink(id, { active: false });
      return;
    }

    const activeCount = links.filter((link) => link.active).length;
    if (activeCount >= 4) {
      setLinksError("Limite de 4 links ativos. Desative um para ativar outro.");
      return;
    }

    setLinksError(null);
    updateLink(id, { active: true });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((item) => item.id === active.id);
      const newIndex = links.findIndex((item) => item.id === over.id);
      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl px-4 md:px-0 animate-in fade-in duration-500">
      <LinktreeHeader
        displayName={displayName}
        setDisplayName={setDisplayName}
        tagline={tagline}
        setTagline={setTagline}
        linktreeSlug={linktreeSlug}
        setLinktreeSlug={setLinktreeSlug}
        {...(onSlugBlur !== undefined ? { onSlugBlur } : {})}
        slugError={slugError ?? null}
        isCheckingSlug={Boolean(isCheckingSlug)}
        {...(avatarUrl !== undefined ? { avatarUrl } : {})}
        setAvatarUrl={setAvatarUrl}
        {...(avatarPath !== undefined ? { avatarPath } : {})}
        setAvatarPath={setAvatarPath}
        {...(backgroundImageUrl !== undefined ? { backgroundImageUrl } : {})}
        setBackgroundImageUrl={setBackgroundImageUrl}
        {...(backgroundImagePath !== undefined ? { backgroundImagePath } : {})}
        setBackgroundImagePath={setBackgroundImagePath}
        socials={socials}
        setSocials={setSocials}
        {...(onAvatarUpload !== undefined ? { onAvatarUpload } : {})}
        {...(onBackgroundUpload !== undefined ? { onBackgroundUpload } : {})}
      />
      {linksError ? <p className="text-sm text-red-500 mb-4">{linksError}</p> : null}

      {/* Primary Add Link Button */}
      <div className="pt-4 mb-8 space-y-3">
        <BrandButton
          onClick={addLink}
          variant="secondary"
          className="w-full h-12 rounded-full font-bold text-base flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
        >
          <Plus className="size-5 stroke-[2.5px]" />
          Adicionar
        </BrandButton>
        <div className="grid grid-cols-2 gap-2">
          <BrandButton
            variant="neutral"
            className="rounded-full h-10"
            onClick={onAddEssentialLinks}
          >
            Adição rápida
          </BrandButton>
          <BrandButton
            variant="neutral"
            className="rounded-full h-10"
            onClick={onResetEssentialLinks}
          >
            Restaurar essenciais
          </BrandButton>
        </div>
      </div>

      {/* Links List with Sortable */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links} strategy={verticalListSortingStrategy}>
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <FluriSortableLinkItem
                key={link.id}
                link={link}
                onUpdate={updateLink}
                onRemove={removeLink}
                onToggleActive={_toggleLinkActive}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Themes */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-zinc-900">Temas</h3>
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
            Selecione um estilo
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {LINKTREE_THEMES.map((theme) => (
            <ThemePreviewCard
              key={theme.id}
              theme={theme}
              selected={theme.id === themeId}
              onClick={() => setThemeId(theme.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ThemePreviewCard({
  theme,
  selected,
  onClick,
}: {
  theme: LinktreeTheme;
  selected: boolean;
  onClick: () => void;
}) {
  const darkenHex = (hex: string, amount = 0.12) => {
    const sanitized = hex.replace("#", "");
    if (sanitized.length !== 6) return hex;
    const num = parseInt(sanitized, 16);
    const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount));
    const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount));
    const b = Math.max(0, (num & 0xff) * (1 - amount));
    return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
  };
  const radius =
    theme.rounded === "none"
      ? "rounded-none"
      : theme.rounded === "xs"
        ? "rounded-sm"
        : theme.rounded === "sm"
          ? "rounded-md"
          : theme.rounded === "md"
            ? "rounded-lg"
            : theme.rounded === "xl"
              ? "rounded-xl"
              : "rounded-full";
  const avatarRadius =
    theme.rounded === "none"
      ? "rounded-none"
      : theme.rounded === "xs"
        ? "rounded-sm"
        : theme.rounded === "sm"
          ? "rounded-md"
          : theme.rounded === "md"
            ? "rounded-lg"
            : theme.rounded === "xl"
              ? "rounded-xl"
              : "rounded-full";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex h-full w-full cursor-pointer flex-col items-start overflow-hidden rounded-2xl border p-0 transition-all bg-card gap-0 text-left",
        selected
          ? "border-foreground shadow-sm ring-1 ring-foreground"
          : "border-border hover:border-muted-foreground/50",
      )}
      aria-pressed={selected}
    >
      <div
        className="relative w-full aspect-9/18 overflow-hidden border-b rounded-t-2xl shrink-0"
        style={{
          background: theme.colors.background,
          borderColor: theme.colors.border,
        }}
      >
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            height: "25%",
            background: darkenHex(theme.colors.accent || theme.colors.background, 0.18),
          }}
        />
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 shadow-sm flex items-center justify-center",
            avatarRadius,
          )}
          style={{
            top: "25%",
            background: theme.colors.accent,
          }}
        >
          <User className="size-4 opacity-70 text-foreground/70" />
        </div>
        <div className="absolute top-[37%] left-1/2 -translate-x-1/2 w-3/4 space-y-1 flex flex-col items-center">
          <div className="h-1 rounded-full w-[55%]" style={{ background: theme.colors.border }} />
          <div className="h-1 rounded-full w-[70%]" style={{ background: theme.colors.border }} />
        </div>
        <div className="absolute top-[47%] left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="h-3.5 w-3.5 rounded-full"
              style={{ background: theme.colors.border }}
            />
          ))}
        </div>
        <div className="absolute top-[58%] left-1/2 -translate-x-1/2 w-3/4 space-y-1.5">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className={`h-4 border ${radius}`}
              style={{
                background: idx === 0 ? theme.colors.primary : theme.colors.surface,
                borderColor: idx === 0 ? theme.colors.primary : theme.colors.border,
              }}
            />
          ))}
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 opacity-50">
          <span className="text-[5px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
            Made with
          </span>
          <FluriLogo className="w-[18px] h-[6px] grayscale" />
        </div>
      </div>
      <div className="p-3 space-y-1 w-full flex-1">
        <p className="text-sm font-bold text-foreground leading-tight break-words whitespace-normal">
          {theme.name}
        </p>
        <p className="text-[10px] leading-snug text-muted-foreground break-words whitespace-normal">
          {theme.description}
        </p>
      </div>
    </button>
  );
}
