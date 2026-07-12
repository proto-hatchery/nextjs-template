/**
 * Visual indicator for note save status.
 *
 * Shows inline status (not toast) for:
 * - Saving state
 * - Saved with timestamp
 * - Local-only (offline)
 * - Error state
 * - Conflict state
 *
 * @see ADR-015 for architecture decisions
 */

"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Cloud, CloudOff, Loader2, RefreshCw } from "lucide-react";
import type { SyncState } from "./use-robust-note-autosave";
import { formatTimeAgo } from "./autosave-utils";

export interface NoteSaveStatusIndicatorProps {
  syncState: SyncState;
  lastSyncedAt: number | null;
  dirty: boolean;
  onRetry?: () => void;
  onResolveConflict?: () => void;
  className?: string;
}

export function NoteSaveStatusIndicator({
  syncState,
  lastSyncedAt,
  dirty,
  onRetry,
  onResolveConflict,
  className = "",
}: NoteSaveStatusIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  // Update "saved X ago" text
  useEffect(() => {
    if (syncState !== "synced" || !lastSyncedAt) return;

    const updateTimeAgo = () => {
      setTimeAgo(formatTimeAgo(lastSyncedAt));
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000);

    return () => clearInterval(interval);
  }, [syncState, lastSyncedAt]);

  const baseClasses = `flex items-center gap-1.5 text-xs whitespace-nowrap ${className}`;

  switch (syncState) {
    case "syncing":
      return (
        <div className={baseClasses + " text-muted-foreground"}>
          <Loader2 className="size-3 animate-spin" />
          <span>Salvando...</span>
        </div>
      );

    case "synced":
      if (dirty) {
        return (
          <div className={baseClasses + " text-muted-foreground"}>
            <Cloud className="size-3" />
            <span>Sincronizando...</span>
          </div>
        );
      }
      return (
        <div className={baseClasses + " text-muted-foreground"}>
          <Check className="size-3 text-emerald-500" />
          <span>{lastSyncedAt ? `Salvo ${timeAgo}` : "Salvo"}</span>
        </div>
      );

    case "local-only":
      return (
        <div className={baseClasses + " text-amber-600 dark:text-amber-500"}>
          <CloudOff className="size-3" />
          <span>Salvo localmente</span>
        </div>
      );

    case "error":
      return (
        <button
          type="button"
          onClick={onRetry}
          className={baseClasses + " text-destructive hover:text-destructive/80 cursor-pointer"}
        >
          <AlertCircle className="size-3" />
          <span>Erro ao salvar — tentar novamente</span>
        </button>
      );

    case "conflict":
      return (
        <button
          type="button"
          onClick={onResolveConflict}
          className={
            baseClasses +
            " text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 cursor-pointer"
          }
        >
          <RefreshCw className="size-3" />
          <span>Conflito de versão — resolver</span>
        </button>
      );

    case "idle":
    default:
      if (dirty) {
        return (
          <div className={baseClasses + " text-muted-foreground"}>
            <div className="size-1.5 rounded-full bg-muted-foreground/50" />
            <span>Editando...</span>
          </div>
        );
      }
      return <span className={baseClasses + " text-muted-foreground"}>Comece a editar</span>;
  }
}
