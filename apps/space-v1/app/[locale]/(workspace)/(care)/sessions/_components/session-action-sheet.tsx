"use client";

import { type SessionWithDetails } from "@workspace/supabase-data/types/entities";
import { cancelSessionAction } from "@workspace/supabase-data/actions/sessions/cancel-session";
import { deleteSessionAction } from "@workspace/supabase-data/actions/sessions/delete-session";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { Sheet, SheetContent, SheetTitle } from "@workspace/ui/components/sheet";
import { VisuallyHidden } from "@workspace/ui/lib/visually-hidden";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Calendar, FileText, MapPin, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { SessionClinicalNoteButton } from "./session-clinical-note-button";
import { SessionLocationDialog } from "./session-location-dialog";
import { SessionStatusSheet } from "./session-status-sheet";

interface SessionActionSheetProps {
  session: SessionWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ActionItem {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  warning?: boolean;
}

export function SessionActionSheet({ session, open, onOpenChange }: SessionActionSheetProps) {
  const sessionId = session.id ?? "";
  const [isStatusSheetOpen, setIsStatusSheetOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const router = useRouter();

  const status = session.status ?? "scheduled";

  const handleCancel = async () => {
    setIsMutating(true);
    try {
      unwrapActionResult(
        await cancelSessionAction({ sessionId, reason: "Cancelada pelo profissional" }),
      );
      toast.success("Sessão cancelada");
      router.refresh();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao cancelar sessão");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = () => {
    onOpenChange(false);

    setTimeout(() => {
      if (
        !window.confirm(
          "Tem certeza que deseja EXCLUIR esta sessão? Esta ação irá remover completamente a sessão, a cobrança e o evento do calendário. Use 'Cancelar' se quiser manter o registro.",
        )
      ) {
        return;
      }

      void (async () => {
        setIsMutating(true);
        try {
          unwrapActionResult(await deleteSessionAction({ sessionId }));
          toast.success("Sessão excluída com sucesso");
          router.refresh();
        } catch {
          toast.error("Erro ao excluir sessão");
        } finally {
          setIsMutating(false);
        }
      })();
    }, 300);
  };

  const actions: ActionItem[] = [
    {
      icon: FileText,
      label: "Notas Clínicas",
      onClick: () => {
        // Handled by SessionClinicalNoteButton
      },
    },
    {
      icon: MapPin,
      label: "Mudar Local",
      onClick: () => {
        onOpenChange(false);
        setTimeout(() => setIsLocationDialogOpen(true), 300);
      },
    },
    {
      icon: Calendar,
      label: "Solicitar Reagendamento",
      onClick: () => {
        toast.info("Funcionalidade em desenvolvimento");
        onOpenChange(false);
      },
      disabled: true,
    },
  ];

  const destructiveActions: ActionItem[] = [
    {
      icon: XCircle,
      label: "Cancelar Sessão",
      onClick: () => void handleCancel(),
      disabled: isMutating || status === "cancelled" || status === "completed" || status === "no_show",
      warning: true,
    },
    {
      icon: Trash2,
      label: "Excluir Sessão",
      onClick: handleDelete,
      disabled: isMutating || (status !== "scheduled" && status !== "cancelled"),
      destructive: true,
    },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="p-0 pb-safe rounded-t-3xl border-t bg-background"
          showCloseButton={false}
        >
          <VisuallyHidden.Root>
            <SheetTitle>Ações da Sessão</SheetTitle>
          </VisuallyHidden.Root>

          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-4">
            <div className="w-9 h-1 bg-border/60 rounded-full" />
          </div>

          {/* Content with max height and scroll */}
          <div className="max-h-[75vh] overflow-y-auto">
            {/* Patient Info Header */}
            <div className="px-4 pb-6 text-center">
              <h3 className="text-[17px] font-semibold text-foreground leading-tight">
                {session.patientName}
              </h3>
              {session.serviceName && (
                <p className="text-[13px] text-muted-foreground mt-1">{session.serviceName}</p>
              )}
            </div>

            {/* Primary Actions - Grouped card style */}
            <div className="px-4 pb-3">
              <div className="bg-muted/50 rounded-xl overflow-hidden">
                {actions.map((action, index) => {
                  // Special handling for clinical notes
                  if (action.icon === FileText) {
                    return (
                      <div key={action.label} className="relative">
                        <SessionClinicalNoteButton
                          sessionId={sessionId}
                          patientId={session.psychologist_patient_id}
                          patientName={session.patientName}
                          variant="sheet-item"
                          onOpenChange={(noteOpen) => {
                            if (noteOpen) {
                              onOpenChange(false);
                            }
                          }}
                        />
                        {index !== actions.length - 1 && (
                          <div className="absolute bottom-0 left-14 right-0 h-[0.5px] bg-border/50" />
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={action.label} className="relative">
                      <BrandButton
                        variant="ghost"
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className="flex items-center gap-3 px-4 py-3.5 w-full text-left transition-colors active:bg-muted disabled:opacity-40 disabled:cursor-not-allowed justify-start"
                      >
                        <action.icon className="w-5 h-5 text-foreground" />
                        <span className="text-[15px] text-foreground font-medium">
                          {action.label}
                        </span>
                      </BrandButton>
                      {index !== actions.length - 1 && (
                        <div className="absolute bottom-0 left-4 right-4 h-px bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Action - Separate card */}
            <div className="px-4 pb-3">
              <div className="bg-muted/50 rounded-xl overflow-hidden">
                <BrandButton
                  variant="ghost"
                  onClick={() => {
                    onOpenChange(false);
                    setTimeout(() => setIsStatusSheetOpen(true), 300);
                  }}
                  disabled={status === "cancelled"}
                  className="flex items-center gap-3 px-4 py-3.5 w-full text-left transition-colors active:bg-muted disabled:opacity-40 disabled:cursor-not-allowed justify-start"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <span className="text-[15px] text-foreground font-medium">Atualizar Status</span>
                </BrandButton>
              </div>
            </div>

            {/* Destructive Actions - Separate cards */}
            {destructiveActions.map((action) => (
              <div key={action.label} className="px-4 pb-3">
                <div className="bg-muted/50 rounded-xl overflow-hidden">
                  <BrandButton
                    variant="ghost"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className="flex items-center gap-3 px-4 py-3.5 w-full text-left transition-colors active:bg-muted disabled:opacity-40 disabled:cursor-not-allowed justify-start"
                  >
                    <action.icon
                      className={`w-5 h-5 ${
                        action.destructive
                          ? "text-destructive"
                          : action.warning
                            ? "text-orange-500"
                            : "text-foreground"
                      }`}
                    />
                    <span
                      className={`text-[15px] font-medium ${
                        action.destructive
                          ? "text-destructive"
                          : action.warning
                            ? "text-orange-500"
                            : "text-foreground"
                      }`}
                    >
                      {action.label}
                    </span>
                  </BrandButton>
                </div>
              </div>
            ))}

            {/* Cancel Button */}
            <div className="px-4 pb-4">
              <div className="bg-muted/50 rounded-xl overflow-hidden">
                <BrandButton
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="h-auto rounded-none flex items-center justify-center py-3.5 w-full text-[15px] font-semibold text-foreground transition-colors active:bg-muted"
                >
                  Cancelar
                </BrandButton>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Status Update Sheet */}
      <SessionStatusSheet
        session={session}
        open={isStatusSheetOpen}
        onOpenChange={setIsStatusSheetOpen}
      />

      {/* Location Dialog (keeping as dialog for now, can be converted to sheet) */}
      <SessionLocationDialog
        session={session}
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
      />
    </>
  );
}
