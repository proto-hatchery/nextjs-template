"use client";

import type { NoteWithDetails } from "@workspace/supabase-data/types/entities";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

import {
  PatientDetailCardItem,
  PatientDetailCardItemActions,
} from "../../shared/patient-detail-card-item";

const NOTE_TYPES: Record<string, string> = {
  clinical_note: "Nota Clínica",
  progress_note: "Evolução",
};

interface NoteItemProps {
  note: Pick<NoteWithDetails, "id" | "note_type" | "title" | "created_at" | "updated_at">;
  onDelete: () => void;
  onGenerateAI?: () => void;
  isGenerating?: boolean;
}

export function NoteItem({ note, onDelete, onGenerateAI, isGenerating }: NoteItemProps) {
  if (!note.note_type) return null;

  const noteTypeLabel = NOTE_TYPES[note.note_type] ?? note.note_type;
  const timeAgo = formatDistanceToNow(new Date(note.updated_at ?? note.created_at ?? new Date()), {
    locale: ptBR,
    addSuffix: true,
  });

  const createdDate = note.created_at ? new Date(note.created_at) : null;
  const formattedDate =
    createdDate && !Number.isNaN(createdDate.getTime())
      ? format(createdDate, "dd/MM/yyyy", { locale: ptBR })
      : null;

  const noteTitle = note.title ?? "Sem título";

  return (
    <PatientDetailCardItem
      icon={<FileText className="size-5 text-muted-foreground" />}
      actions={
        <PatientDetailCardItemActions onDelete={onDelete} deleteAriaLabel="Excluir nota">
          {note.note_type === "clinical_note" && onGenerateAI ? (
            <BrandButton
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-background/80 hover:text-blue-600"
              disabled={isGenerating}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                onGenerateAI();
              }}
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin text-blue-600" />
              ) : (
                <Sparkles className="size-4" />
              )}
            </BrandButton>
          ) : null}
        </PatientDetailCardItemActions>
      }
    >
      <Link
        href={`/notes/${note.id}`}
        className="block min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md -m-2 p-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{noteTitle}</p>
          {formattedDate && (
            <span className="text-xs text-muted-foreground shrink-0">• {formattedDate}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {noteTypeLabel}
          {timeAgo ? ` • ${timeAgo}` : ""}
        </p>
      </Link>
    </PatientDetailCardItem>
  );
}
