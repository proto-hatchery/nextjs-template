"use client";

import type { SessionWithDetails } from "@workspace/supabase-data/types/entities";
import { usePsychologistLocations } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { updateSessionAction } from "@workspace/supabase-data/actions/sessions/update-session";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Description,
  FluriDialogV2Footer,
  FluriDialogV2Header,
  FluriDialogV2Title,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { Check, Loader2, MapPin, Plus } from "lucide-react";
import { Monitor } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface SessionLocationDialogProps {
  session: SessionWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ONLINE_OPTION_ID = "online";

function getLocationSummary(location: {
  street: string | null;
  number: string | null;
  city: string | null;
  state: string | null;
}) {
  const streetLine = [location.street, location.number].filter(Boolean).join(", ");
  const cityLine = [location.city, location.state].filter(Boolean).join(" - ");
  const summary = [streetLine, cityLine].filter(Boolean).join(" • ");
  return summary || "Endereço não informado";
}

export function SessionLocationDialog({ session, open, onOpenChange }: SessionLocationDialogProps) {
  const sessionId = session.id ?? "";
  const { data: locations = [], isPending: isPendingLocations } = usePsychologistLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    session.location_id ?? null,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const activeLocations = useMemo(
    () => locations.filter((location) => location.is_active !== false),
    [locations],
  );

  const currentLocationId = session.location_id ?? null;
  const hasChanges = selectedLocationId !== currentLocationId;

  useEffect(() => {
    if (open) {
      setSelectedLocationId(session.location_id ?? null);
    }
  }, [open, session.location_id]);

  const handleSave = async () => {
    if (!hasChanges) {
      onOpenChange(false);
      return;
    }

    setIsUpdating(true);
    try {
      unwrapActionResult(await updateSessionAction({
        sessionId,
        data: { locationId: selectedLocationId },
      }));

      toast.success("Local atualizado com sucesso");
      router.refresh();
      onOpenChange(false);
    } catch (ignoreError) {
      toast.error("Erro ao atualizar o local da sessão");
    } finally {
      setIsUpdating(false);
    }
  };

  const options = useMemo(
    () => [
      {
        id: ONLINE_OPTION_ID,
        label: "Online",
        description: "Atendimento remoto por videochamada",
        icon: Monitor,
      },
      ...activeLocations.map((location) => ({
        id: location.id,
        label: location.name ?? "Local sem nome",
        description: getLocationSummary(location),
        icon: MapPin,
      })),
    ],
    [activeLocations],
  );

  return (
    <FluriDialogV2 open={open} onOpenChange={onOpenChange}>
      <FluriDialogV2Content className="sm:max-w-lg">
        <FluriDialogV2Header>
          <FluriDialogV2Title>Mudar local da sessão</FluriDialogV2Title>
          <FluriDialogV2Description>
            Sessão com {session.patientName}. Escolha onde o atendimento vai acontecer.
          </FluriDialogV2Description>
        </FluriDialogV2Header>

        <div className="space-y-3 py-2">
          {options.map((option) => {
            const isOnline = option.id === ONLINE_OPTION_ID;
            const isSelected = isOnline
              ? selectedLocationId === null
              : selectedLocationId === option.id;
            const Icon = option.icon;

            return (
              <BrandButton
                key={option.id}
                type="button"
                onClick={() => setSelectedLocationId(isOnline ? null : option.id)}
                variant="ghost"
                className={cn(
                  "w-full h-auto justify-start rounded-xl border px-4 py-3 text-left transition-all",
                  "hover:border-primary/50 hover:bg-muted/40",
                  isSelected
                    ? "border-primary/40 bg-primary/5 shadow-sm"
                    : "border-border bg-background",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg",
                      isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{option.label}</p>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </BrandButton>
            );
          })}

          {activeLocations.length === 0 && !isPendingLocations && (
            <div className="rounded-xl border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-sm text-muted-foreground">
              <p>Você ainda não tem locais cadastrados.</p>
              <Link
                href="/preferences/service"
                className="inline-flex items-center justify-center gap-2 mt-3 w-full h-8 px-3 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Criar novo local
              </Link>
            </div>
          )}
        </div>

        <FluriDialogV2Footer>
          <BrandButton variant="neutral" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Cancelar
          </BrandButton>
          <BrandButton onClick={() => void handleSave()} disabled={isUpdating || !hasChanges}>
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </BrandButton>
        </FluriDialogV2Footer>
      </FluriDialogV2Content>
    </FluriDialogV2>
  );
}
