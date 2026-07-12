"use client";

import type { SessionWithDetails } from "@workspace/supabase-data/types/entities";
import { changeSessionStatusAction } from "@workspace/supabase-data/actions/sessions/change-session-status";
import { completeSessionAction } from "@workspace/supabase-data/actions/sessions/complete-session";
import { markSessionNoShowAction } from "@workspace/supabase-data/actions/sessions/mark-session-no-show";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { Sheet, SheetContent, SheetTitle } from "@workspace/ui/components/sheet";
import { VisuallyHidden } from "@workspace/ui/lib/visually-hidden";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Check, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { SessionStatus } from "./session-status-badge";

interface SessionStatusSheetProps {
  session: SessionWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StatusOption {
  value: SessionStatus;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const statusOptions: StatusOption[] = [
  {
    value: "completed",
    label: "Concluída",
    description: "Sessão realizada com sucesso",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    value: "no_show",
    label: "Não Compareceu",
    description: "Paciente não compareceu à sessão",
    icon: XCircle,
    color: "text-orange-600",
  },
  {
    value: "scheduled",
    label: "Agendada",
    description: "Sessão aguardando realização",
    icon: CheckCircle,
    color: "text-blue-600",
  },
];

export function SessionStatusSheet({ session, open, onOpenChange }: SessionStatusSheetProps) {
  const sessionId = session.id ?? "";
  const normalizeStatus = (status: string | null | undefined): SessionStatus => {
    if (
      status === "scheduled" ||
      status === "open" ||
      status === "completed" ||
      status === "cancelled" ||
      status === "no_show"
    ) {
      return status;
    }
    return "scheduled";
  };

  const [selectedStatus, setSelectedStatus] = useState<SessionStatus>(
    normalizeStatus(session.status),
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const currentStatus: SessionStatus = normalizeStatus(session.status);
  const router = useRouter();

  const handleStatusChange = async (newStatus: SessionStatus) => {
    if (newStatus === currentStatus) {
      onOpenChange(false);
      return;
    }

    setSelectedStatus(newStatus);

    try {
      setIsUpdating(true);
      if (newStatus === "completed") {
        unwrapActionResult(await completeSessionAction({ sessionId }));
        toast.success("Sessão marcada como concluída");
      } else if (newStatus === "no_show") {
        unwrapActionResult(await markSessionNoShowAction({ sessionId }));
        toast.success("Sessão marcada como não comparecimento");
      } else if (newStatus === "scheduled") {
        unwrapActionResult(await changeSessionStatusAction({ sessionId, status: "scheduled" }));
        toast.success("Status revertido para agendada");
      }
      router.refresh();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao atualizar status");
      setSelectedStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="p-0 pb-safe rounded-t-3xl border-t bg-background"
        showCloseButton={false}
      >
        <VisuallyHidden.Root>
          <SheetTitle>Atualizar Status da Sessão</SheetTitle>
        </VisuallyHidden.Root>

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-9 h-1 bg-border/60 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-6 text-center">
          <h3 className="text-[17px] font-semibold text-foreground">Atualizar Status</h3>
          <p className="text-[13px] text-muted-foreground mt-1">
            Selecione o novo status da sessão
          </p>
        </div>

        {/* Status Options - Grouped card */}
        <div className="px-4 pb-3">
          <div className="bg-muted/50 rounded-xl overflow-hidden">
            {statusOptions.map((option, index) => {
              const isSelected = selectedStatus === option.value;
              const isCurrent = currentStatus === option.value;
              const isDisabled = option.value === "scheduled" && currentStatus === "cancelled";

              return (
                <div key={option.value} className="relative">
                  <BrandButton
                    variant="ghost"
                    onClick={() => void handleStatusChange(option.value)}
                    disabled={isDisabled || isUpdating}
                    className="flex items-center gap-3 px-4 py-3.5 w-full text-left h-auto justify-start"
                  >
                    {/* Icon */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                        isCurrent ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <option.icon
                        className={`w-5 h-5 ${isCurrent ? option.color : "text-muted-foreground"}`}
                      />
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-medium text-foreground">
                          {option.label}
                        </span>
                        {isCurrent && (
                          <span className="text-xs text-muted-foreground">(Atual)</span>
                        )}
                      </div>
                    </div>

                    {/* Check mark */}
                    {isSelected && <Check className="w-5 h-5 text-primary shrink-0" />}
                  </BrandButton>
                  {index !== statusOptions.length - 1 && (
                    <div className="absolute bottom-0 left-4 right-4 h-px bg-border" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cancel Button */}
        <div className="px-4 pb-4">
          <div className="bg-muted/50 rounded-xl overflow-hidden">
            <BrandButton
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-center py-3.5 w-full text-[15px] font-semibold h-auto"
            >
              Cancelar
            </BrandButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
