"use client";

import { generateClinicalNoteSummaryAction } from "@workspace/supabase-data/actions/notes/generate-clinical-note-summary";
import { isActionError } from "@workspace/supabase-data/lib/boundary/action-error";
import { unwrapActionResultVoid } from "@workspace/supabase-data/lib/boundary/unwrap-action";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function useNoteGeneration(onSuccess?: () => void) {
  const [isGenerating, startTransition] = useTransition();
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const generateAI = (noteId: string) => {
    setShowLoadingModal(true);
    startTransition(async () => {
      try {
        unwrapActionResultVoid(await generateClinicalNoteSummaryAction({ sourceNoteId: noteId }));
        toast.success("Evolução clínica gerada com sucesso!");
        onSuccess?.();
      } catch (error) {
        if (isActionError(error)) {
          toast.error(error.message);
        } else {
          toast.error("Erro inesperado ao gerar evolução clínica");
        }
      } finally {
        setShowLoadingModal(false);
      }
    });
  };

  return {
    generateAI,
    isGenerating,
    showLoadingModal,
    setShowLoadingModal,
  };
}
