"use client";

import {
  useClinicalNotesByPatient,
  useProgressNotesByPatient,
} from "@workspace/supabase-data/hooks/notes";
import { deleteClinicalNoteAction } from "@workspace/supabase-data/actions/notes/delete-clinical-note";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { MultiStepLoader } from "@workspace/brand/patterns/aceternity/multi-step-loader";
import { FileText, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  PatientDetailCardEmptyState,
  PatientDetailCardErrorState,
  PatientDetailCardLoadingState,
} from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";
import { NoteDeleteDialog } from "./note-delete-dialog";
import { NoteItem } from "./note-item";
import { RegenerationWarningDialog } from "./regeneration-warning-dialog";
import { useNoteGeneration } from "./use-note-generation";

export interface PatientInterventionsNotesSectionProps {
  patientId: string;
}

export function PatientInterventionsNotesSection({
  patientId,
}: PatientInterventionsNotesSectionProps) {
  const router = useRouter();
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; title: string | null } | null>(
    null,
  );
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [isNavigatingToNote, setIsNavigatingToNote] = useState(false);
  const [isNavigatingToProgressNote, setIsNavigatingToProgressNote] = useState(false);

  const clinicalNotesQueryResult = useClinicalNotesByPatient(patientId);
  const progressNotesQueryResult = useProgressNotesByPatient(patientId);

  const clinicalNotes = clinicalNotesQueryResult.data! ?? [];
  const progressNotes = progressNotesQueryResult.data! ?? [];
  const isPending = clinicalNotesQueryResult.isPending || progressNotesQueryResult.isPending;
  const error = clinicalNotesQueryResult.error ?? progressNotesQueryResult.error;

  const refetch = () => {
    void clinicalNotesQueryResult.refetch();
    void progressNotesQueryResult.refetch();
  };

  const { generateAI, isGenerating, showLoadingModal, setShowLoadingModal } =
    useNoteGeneration(refetch);

  const [generationWarning, setGenerationWarning] = useState<{
    sourceNoteId: string;
    existingEvolutionId: string;
  } | null>(null);

  const handleDelete = async () => {
    if (!noteToDelete) return;
    try {
      setIsDeletingNote(true);
      unwrapActionResult(await deleteClinicalNoteAction({ noteId: noteToDelete.id }));
      refetch();
      toast.success("Nota deletada com sucesso");
      setNoteToDelete(null);
    } catch {
      const message = "Erro ao deletar nota";
      toast.error(message);
    } finally {
      setIsDeletingNote(false);
    }
  };

  const handleGenerateAI = (noteId: string, existingEvolutionId: string | null) => {
    if (existingEvolutionId) {
      setGenerationWarning({ sourceNoteId: noteId, existingEvolutionId });
      return;
    }
    generateAI(noteId);
  };

  if (isPending) {
    return (
      <div className="space-y-6">
        <PatientDetailSubheader title="Notas Clínicas" />
        <PatientDetailCardLoadingState message="Carregando notas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PatientDetailSubheader title="Evolução Clínica" />
        <PatientDetailCardErrorState
          message="Não foi possível carregar as notas."
          onRetry={refetch}
        />
      </div>
    );
  }

  const loadingStates = [
    { text: "Analisando informações clínicas..." },
    { text: "Identificando padrões relevantes..." },
    { text: "Processando contexto do paciente..." },
    { text: "Estruturando evolução clínica..." },
    { text: "Revisando conteúdo gerado..." },
    { text: "Finalizando documento..." },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-6">
        <PatientDetailSubheader title="Notas Clínicas">
          <BrandButton
            variant="ghost"
            size="sm"
            family="rounded"
            disabled={isNavigatingToNote}
            onClick={() => {
              setIsNavigatingToNote(true);
              router.push(`/notes/new?patientId=${patientId}`);
            }}
          >
            {isNavigatingToNote ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
            Nova nota clínica
          </BrandButton>
        </PatientDetailSubheader>

        {clinicalNotes.length === 0 ? (
          <PatientDetailCardEmptyState
            icon={FileText}
            title="Nenhuma nota clínica criada"
            subtitle="Registre suas observações e anotações clínicas"
          />
        ) : (
          <div className="space-y-3">
            {clinicalNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onDelete={() => setNoteToDelete({ id: note.id, title: note.title })}
                onGenerateAI={() => handleGenerateAI(note.id, null)}
                isGenerating={isGenerating}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <PatientDetailSubheader title="Evolução Clínica">
          <BrandButton
            variant="ghost"
            size="sm"
            family="rounded"
            disabled={isNavigatingToProgressNote}
            onClick={() => {
              setIsNavigatingToProgressNote(true);
              router.push(`/notes/new?patientId=${patientId}&type=progress_note`);
            }}
          >
            {isNavigatingToProgressNote ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
            Nova evolução clínica
          </BrandButton>
        </PatientDetailSubheader>

        {progressNotes.length === 0 ? (
          <PatientDetailCardEmptyState
            icon={FileText}
            title="Nenhuma evolução clínica criada"
            subtitle="Documente a evolução do tratamento ao longo do tempo"
          />
        ) : (
          <div className="space-y-3">
            {progressNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onDelete={() => setNoteToDelete({ id: note.id, title: note.title })}
              />
            ))}
          </div>
        )}
      </section>

      <RegenerationWarningDialog
        isOpen={!!generationWarning}
        onClose={() => setGenerationWarning(null)}
        onRegenerate={() => {
          if (generationWarning) generateAI(generationWarning.sourceNoteId);
          setGenerationWarning(null);
        }}
        existingEvolutionId={generationWarning?.existingEvolutionId ?? ""}
      />

      <NoteDeleteDialog
        noteToDelete={noteToDelete}
        onDelete={() => {
          void handleDelete();
        }}
        onClose={() => setNoteToDelete(null)}
        isDeleting={isDeletingNote}
      />

      <MultiStepLoader
        loadingStates={loadingStates}
        loading={showLoadingModal}
        duration={2000}
        loop={false}
      />

      {showLoadingModal && (
        <BrandButton
          variant="ghost"
          size="icon-lg"
          className="fixed top-4 right-4 text-black dark:text-white z-120"
          onClick={() => setShowLoadingModal(false)}
        >
          <X className="h-10 w-10" />
        </BrandButton>
      )}
    </div>
  );
}
