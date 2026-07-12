"use client";

import type { ClinicalSessionStatus, SessionWithDetails } from "@workspace/supabase-data/types/entities";
import { changeSessionStatusAction } from "@workspace/supabase-data/actions/sessions/change-session-status";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Description,
  FluriDialogV2Footer,
  FluriDialogV2Header,
  FluriDialogV2Title,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { CheckCircle2, Loader2, X, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface SessionStatusUpdateDialogProps {
  session: SessionWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: {
  value: ClinicalSessionStatus;
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  color: string;
}[] = [
  {
    value: "completed",
    label: "Concluir",
    description: "Marcar sessão como concluída",
    icon: CheckCircle2,
    color: "text-green-600",
  },
  {
    value: "cancelled",
    label: "Cancelar",
    description: "Cancelar esta sessão",
    icon: XCircle,
    color: "text-destructive",
  },
  {
    value: "no_show",
    label: "Não Compareceu",
    description: "Paciente não compareceu à sessão",
    icon: X,
    color: "text-orange-600",
  },
];

export function SessionStatusUpdateDialog({
  session,
  open,
  onOpenChange,
}: SessionStatusUpdateDialogProps) {
  const sessionId = session.id ?? "";
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: ClinicalSessionStatus) => {
    setIsUpdating(true);
    try {
      unwrapActionResult(await changeSessionStatusAction({
        sessionId,
        status: newStatus,
      }));

      toast.success(
        `Sessão marcada como: ${STATUS_OPTIONS.find((s) => s.value === newStatus)?.label}`,
      );
      router.refresh();
      onOpenChange(false);
    } catch (ignoreError) {
      toast.error("Erro ao atualizar status da sessão. Tente novamente.");
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatus = session.status ?? "scheduled";

  return (
    <FluriDialogV2 open={open} onOpenChange={onOpenChange}>
      <FluriDialogV2Content className="sm:max-w-md">
        <FluriDialogV2Header>
          <FluriDialogV2Title>Atualizar Status da Sessão</FluriDialogV2Title>
          <FluriDialogV2Description>Sessão com {session.patientName}</FluriDialogV2Description>
        </FluriDialogV2Header>

        <div className="space-y-2 py-4">
          {STATUS_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isCurrentStatus = currentStatus === option.value;

            return (
              <BrandButton
                key={option.value}
                variant={isCurrentStatus ? "secondary" : "ghost"}
                className="w-full justify-start h-auto py-3 px-4"
                onClick={() => void handleStatusChange(option.value)}
                disabled={isUpdating || isCurrentStatus}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-md ${option.color} bg-current/10`}>
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {isCurrentStatus && <span className="text-xs text-muted-foreground">Atual</span>}
                </div>
              </BrandButton>
            );
          })}
        </div>

        <FluriDialogV2Footer>
          <BrandButton variant="neutral" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Cancelar
          </BrandButton>
        </FluriDialogV2Footer>
      </FluriDialogV2Content>
    </FluriDialogV2>
  );
}
