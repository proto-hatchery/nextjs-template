/**
 * Banner shown when there's a local draft to recover.
 *
 * @see ADR-015 for architecture decisions
 */

"use client";

import { AlertTriangle, FileText, Trash2 } from "lucide-react";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { formatTimeAgo } from "./autosave-utils";
import type { NoteDraftEnvelope } from "./note-drafts-db";

export interface LocalDraftRecoveryBannerProps {
  draft: NoteDraftEnvelope | null;
  onAccept: () => void;
  onDiscard: () => void;
}

export function LocalDraftRecoveryBanner({
  draft,
  onAccept,
  onDiscard,
}: LocalDraftRecoveryBannerProps) {
  if (!draft) return null;

  const timeAgo = draft.updatedAt ? formatTimeAgo(draft.updatedAt) : "recentemente";

  return (
    <div className="flex items-center justify-between gap-4 bg-muted/80 border-b border-border px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-chart-4/20">
          <AlertTriangle className="size-3.5 text-chart-4 shrink-0" />
        </div>
        <span className="text-foreground">Você tem alterações não sincronizadas de {timeAgo}.</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <BrandButton
          variant="ghost"
          size="xs"
          onClick={onAccept}
          className="gap-1.5 bg-foreground/5 hover:bg-foreground/10"
        >
          <FileText className="size-3" />
          Recuperar
        </BrandButton>

        <BrandButton
          variant="ghost"
          size="xs"
          onClick={onDiscard}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="size-3" />
          Descartar
        </BrandButton>
      </div>
    </div>
  );
}
