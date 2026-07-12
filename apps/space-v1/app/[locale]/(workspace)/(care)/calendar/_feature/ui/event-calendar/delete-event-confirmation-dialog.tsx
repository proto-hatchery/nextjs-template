"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, User, Clock } from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

import type { CalendarEventFull, SeriesEditScope } from "./event-quick-view-popover";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Description,
  FluriDialogV2Footer,
  FluriDialogV2Header,
  FluriDialogV2Title,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

// ----------------------------------------------------------------------
// Animation Variants
// ----------------------------------------------------------------------

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

const radioItemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.2 },
  }),
};

const loadingVariants = {
  rotate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface DeleteEventConfirmationDialogProps {
  event: CalendarEventFull | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scope?: SeriesEditScope) => Promise<void>;
  isDeleting?: boolean;
  seriesEventCount?: number;
}

// ----------------------------------------------------------------------
// Utility Functions
// ----------------------------------------------------------------------

const formatEventDateTime = (date: Date): string => {
  const dayStr = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedDay = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
  const timeStr = format(date, "'às' HH:mm", { locale: ptBR });
  return `${capitalizedDay} ${timeStr}`;
};

const formatShortDate = (date: Date): string => {
  return format(date, "d 'de' MMM", { locale: ptBR });
};

// ----------------------------------------------------------------------
// Single Event Delete Confirmation
// ----------------------------------------------------------------------

interface SingleEventDeleteProps {
  event: CalendarEventFull;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function SingleEventDeleteContent({
  event,
  onConfirm,
  onCancel,
  isDeleting,
}: SingleEventDeleteProps) {
  const eventType = event.event_type ?? "other";
  const startDate = new Date(event.start);
  const isSession = eventType === "session";

  return (
    <>
      <FluriDialogV2Header>
        <FluriDialogV2Title className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          {isSession ? "Cancelar Sessão?" : "Excluir Evento?"}
        </FluriDialogV2Title>
        <FluriDialogV2Description asChild>
          <div className="space-y-3 pt-2">
            <p>
              {isSession
                ? "Você está prestes a cancelar a sessão com:"
                : "Você está prestes a excluir o evento:"}
            </p>

            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              {isSession && event.metadata?.patient_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{event.metadata.patient_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{formatEventDateTime(startDate)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Esta ação não pode ser desfeita.</p>
                {isSession && (
                  <p className="mt-1 text-amber-600/80 dark:text-amber-500/80">
                    O paciente deverá ser informado manualmente.
                  </p>
                )}
              </div>
            </div>
          </div>
        </FluriDialogV2Description>
      </FluriDialogV2Header>
      <FluriDialogV2Footer>
        <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
          Voltar
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? "Excluindo..." : "Confirmar cancelamento"}
        </Button>
      </FluriDialogV2Footer>
    </>
  );
}

// ----------------------------------------------------------------------
// Series Event Delete Confirmation (with Scope Selection)
// ----------------------------------------------------------------------

interface SeriesEventDeleteProps {
  event: CalendarEventFull;
  seriesEventCount: number;
  onConfirm: (scope: SeriesEditScope) => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function SeriesEventDeleteContent({
  event,
  seriesEventCount,
  onConfirm,
  onCancel,
  isDeleting,
}: SeriesEventDeleteProps) {
  const [selectedScope, setSelectedScope] = useState<SeriesEditScope>("this");
  const eventType = event.event_type ?? "other";
  const startDate = new Date(event.start);
  const isSession = eventType === "session";

  const handleConfirm = useCallback(() => {
    onConfirm(selectedScope);
  }, [onConfirm, selectedScope]);

  const getAffectedCountText = (): string => {
    switch (selectedScope) {
      case "this":
        return "1 evento será excluído";
      case "this_and_following":
        return `Eventos a partir de ${formatShortDate(startDate)} serão excluídos`;
      case "all":
        return `${seriesEventCount} eventos serão excluídos`;
    }
  };

  return (
    <>
      <FluriDialogV2Header>
        <FluriDialogV2Title className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          {isSession ? "Cancelar Evento Recorrente?" : "Excluir Evento Recorrente?"}
        </FluriDialogV2Title>
        <FluriDialogV2Description asChild>
          <div className="space-y-4 pt-2">
            <p>O que você deseja {isSession ? "cancelar" : "excluir"}?</p>

            <RadioGroup
              value={selectedScope}
              onValueChange={(value) => setSelectedScope(value as SeriesEditScope)}
              className="space-y-3"
            >
              <div
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                  selectedScope === "this"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50",
                )}
                onClick={() => setSelectedScope("this")}
              >
                <RadioGroupItem value="this" id="scope-this" className="mt-0.5" />
                <Label htmlFor="scope-this" className="cursor-pointer flex-1">
                  <div className="font-medium text-foreground">
                    Apenas este evento ({formatShortDate(startDate)})
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    Apenas esta ocorrência será removida
                  </div>
                </Label>
              </div>

              <div
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                  selectedScope === "this_and_following"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50",
                )}
                onClick={() => setSelectedScope("this_and_following")}
              >
                <RadioGroupItem
                  value="this_and_following"
                  id="scope-following"
                  className="mt-0.5"
                />
                <Label htmlFor="scope-following" className="cursor-pointer flex-1">
                  <div className="font-medium text-foreground">Este e os eventos seguintes</div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    Todos os eventos a partir de {formatShortDate(startDate)} serão removidos
                  </div>
                </Label>
              </div>

              <div
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                  selectedScope === "all"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50",
                )}
                onClick={() => setSelectedScope("all")}
              >
                <RadioGroupItem value="all" id="scope-all" className="mt-0.5" />
                <Label htmlFor="scope-all" className="cursor-pointer flex-1">
                  <div className="font-medium text-foreground">Todos os eventos desta série</div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    Todos os eventos, passados e futuros, serão removidos
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>{getAffectedCountText()}</span>
            </div>
          </div>
        </FluriDialogV2Description>
      </FluriDialogV2Header>
      <FluriDialogV2Footer>
        <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
          Voltar
        </Button>
        <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
          {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
        </Button>
      </FluriDialogV2Footer>
    </>
  );
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export function DeleteEventConfirmationDialog({
  event,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
  seriesEventCount = 1,
}: DeleteEventConfirmationDialogProps) {
  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleConfirmSingle = useCallback(async () => {
    await onConfirm();
    onOpenChange(false);
  }, [onConfirm, onOpenChange]);

  const handleConfirmSeries = useCallback(
    async (scope: SeriesEditScope) => {
      await onConfirm(scope);
      onOpenChange(false);
    },
    [onConfirm, onOpenChange],
  );

  if (!event) return null;

  const isSeries = Boolean(event.series_id);

  return (
    <FluriDialogV2 open={open} onOpenChange={onOpenChange}>
      <FluriDialogV2Content>
        {isSeries ? (
          <SeriesEventDeleteContent
            event={event}
            seriesEventCount={seriesEventCount}
            onConfirm={handleConfirmSeries}
            onCancel={handleCancel}
            isDeleting={isDeleting}
          />
        ) : (
          <SingleEventDeleteContent
            event={event}
            onConfirm={handleConfirmSingle}
            onCancel={handleCancel}
            isDeleting={isDeleting}
          />
        )}
      </FluriDialogV2Content>
    </FluriDialogV2>
  );
}
