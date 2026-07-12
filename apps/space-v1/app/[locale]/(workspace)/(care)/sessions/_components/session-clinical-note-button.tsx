"use client";

// Removed lexical imports - now using plain text
import { createClinicalNoteAction } from "@workspace/supabase-data/actions/notes/create-clinical-note";
import { useSessionNote } from "@workspace/supabase-data/hooks/notes";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { FileText, Loader2 } from "lucide-react";
import { StickyNote } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface SessionClinicalNoteButtonProps {
  sessionId: string;
  patientId: string | null;
  patientName: string;
  variant?: "default" | "compact" | "sheet-item";
  onOpenChange?: (open: boolean) => void;
}

/**
 * Button component that handles clinical note creation/access for a session.
 * When clicked:
 * - If a note already exists for the session, navigates to it
 * - If no note exists, creates a new one and then navigates to it
 */
export function SessionClinicalNoteButton({
  sessionId,
  patientId,
  patientName,
  variant = "default",
  onOpenChange,
}: SessionClinicalNoteButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // Check if a note already exists for this session
  const { data: existingNote, isPending: isCheckingNote } = useSessionNote(sessionId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Close parent sheet if provided
    if (onOpenChange) {
      onOpenChange(false);
    }

    // If note already exists, just navigate to it
    if (existingNote?.id) {
      // Small delay for sheet close animation
      setTimeout(() => {
        router.push(`/notes/${existingNote.id}`);
      }, 300);
      return;
    }

    // Create a new clinical note for this session
    setIsCreating(true);
    try {
      const result = unwrapActionResult(await createClinicalNoteAction({
        sessionId,
        patientId: patientId ?? undefined,
        title: `Nota Clínica - ${patientName}`,
        noteType: "clinical_note",
        encodedContent: " ",
      }));

      const noteId = result.note.id;
      if (!noteId) {
        throw new Error("ID da nota não foi retornado");
      }

      // Navigate to the newly created note
      setTimeout(
        () => {
          router.push(`/notes/${noteId}`);
        },
        onOpenChange ? 300 : 0,
      );
    } catch (ignoreError) {
      toast.error("Erro ao criar nota clínica. Tente novamente.");
    } finally {
      setIsCreating(false);
    }
  };

  const isPending = isCheckingNote || isCreating;

  if (variant === "sheet-item") {
    return (
      <BrandButton
        variant="ghost"
        onClick={(e) => void handleClick(e)}
        disabled={isPending}
        className="flex items-center gap-3 px-4 py-3.5 w-full text-left transition-colors active:bg-muted disabled:opacity-40 disabled:cursor-not-allowed justify-start"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 text-foreground animate-spin" />
        ) : (
          <FileText className="w-5 h-5 text-foreground" />
        )}
        <span className="text-[15px] text-foreground font-medium">Notas Clínicas</span>
      </BrandButton>
    );
  }

  if (variant === "compact") {
    return (
      <BrandButton
        variant="ghost"
        onClick={(e) => void handleClick(e)}
        disabled={isPending}
        className="flex items-center gap-1.5 h-auto p-0"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileText className="h-3.5 w-3.5" />
        )}
        <span>Notas</span>
      </BrandButton>
    );
  }

  return (
    <BrandButton
      variant="ghost"
      className="w-full justify-between h-auto py-4 px-4 hover:bg-background border border-transparent hover:border-border hover:shadow-sm transition-all group"
      onClick={(e) => void handleClick(e)}
      disabled={isPending}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <StickyNote className="h-5 w-5" />
          )}
        </div>
        <div className="text-left space-y-0.5">
          <span className="font-semibold text-foreground block">Notas Clínicas</span>
          <span className="text-xs text-muted-foreground block">
            {isPending
              ? "Carregando..."
              : existingNote
                ? "Acessar anotações e evoluções desta sessão"
                : "Anotar detalhes técnicos desta sessão"}
          </span>
        </div>
      </div>
    </BrandButton>
  );
}
