"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Info } from "lucide-react";
import { useState, useCallback } from "react";
import { motion } from "motion/react";

import type { SeriesEditScope } from "./event-quick-view-popover";
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

const radioOptionVariants = {
  initial: { opacity: 0, y: 10 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.2 },
  }),
  hover: {
    scale: 1.01,
    transition: { duration: 0.15 },
  },
  tap: { scale: 0.99 },
};

const infoVariants = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.2 },
  },
};

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface SeriesEditScopeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventDate: Date;
  totalEventCount: number;
  onConfirm: (scope: SeriesEditScope) => Promise<void>;
  isSaving?: boolean;
}

// ----------------------------------------------------------------------
// Utility Functions
// ----------------------------------------------------------------------

const formatShortDate = (date: Date): string => {
  return format(date, "d 'de' MMMM", { locale: ptBR });
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export function SeriesEditScopeDialog({
  open,
  onOpenChange,
  eventDate,
  totalEventCount,
  onConfirm,
  isSaving = false,
}: SeriesEditScopeDialogProps) {
  const [selectedScope, setSelectedScope] = useState<SeriesEditScope>("this");

  const handleConfirm = useCallback(async () => {
    await onConfirm(selectedScope);
  }, [onConfirm, selectedScope]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const getAffectedCountText = (): string => {
    switch (selectedScope) {
      case "this":
        return "1 evento será alterado";
      case "this_and_following":
        return `Eventos a partir de ${formatShortDate(eventDate)} serão alterados`;
      case "all":
        return `${totalEventCount} eventos serão alterados`;
    }
  };

  return (
    <FluriDialogV2 open={open} onOpenChange={onOpenChange}>
      <FluriDialogV2Content className="max-w-md">
        <FluriDialogV2Header>
          <FluriDialogV2Title>Salvar alterações na série?</FluriDialogV2Title>
          <FluriDialogV2Description asChild>
            <div className="space-y-4 pt-2">
              <p>Como você deseja aplicar as alterações?</p>

              <RadioGroup
                value={selectedScope}
                onValueChange={(value) => setSelectedScope(value as SeriesEditScope)}
                className="space-y-3"
              >
                {/* Option: Only this event */}
                <div
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                    selectedScope === "this"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                  onClick={() => setSelectedScope("this")}
                >
                  <RadioGroupItem value="this" id="edit-scope-this" className="mt-0.5" />
                  <Label htmlFor="edit-scope-this" className="cursor-pointer flex-1">
                    <div className="font-medium text-foreground">
                      Apenas este evento ({formatShortDate(eventDate)})
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      As alterações afetarão apenas esta ocorrência
                    </div>
                  </Label>
                </div>

                {/* Option: This and following */}
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
                    id="edit-scope-following"
                    className="mt-0.5"
                  />
                  <Label htmlFor="edit-scope-following" className="cursor-pointer flex-1">
                    <div className="font-medium text-foreground">Este evento e os seguintes</div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      As alterações se aplicarão a partir de {formatShortDate(eventDate)}.
                      <br />
                      <span className="text-xs">
                        Isso criará uma nova série a partir desta data.
                      </span>
                    </div>
                  </Label>
                </div>

                {/* Option: All events */}
                <div
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                    selectedScope === "all"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                  onClick={() => setSelectedScope("all")}
                >
                  <RadioGroupItem value="all" id="edit-scope-all" className="mt-0.5" />
                  <Label htmlFor="edit-scope-all" className="cursor-pointer flex-1">
                    <div className="font-medium text-foreground">Todos os eventos desta série</div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      As alterações afetarão todos os eventos, incluindo passados e futuros.
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Info about affected events */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <span>{getAffectedCountText()}</span>
              </div>
            </div>
          </FluriDialogV2Description>
        </FluriDialogV2Header>
        <FluriDialogV2Footer>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </FluriDialogV2Footer>
      </FluriDialogV2Content>
    </FluriDialogV2>
  );
}
