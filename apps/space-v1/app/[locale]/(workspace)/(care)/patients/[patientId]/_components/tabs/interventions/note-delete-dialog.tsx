"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Footer,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { useState } from "react";

interface NoteDeleteDialogProps {
  noteToDelete: { id: string; title: string | null } | null;
  onDelete: () => void;
  onClose: () => void;
  isDeleting: boolean;
}

export function NoteDeleteDialog({
  noteToDelete,
  onDelete,
  onClose,
  isDeleting,
}: NoteDeleteDialogProps) {
  const isMobile = useIsMobile();
  const [confirmationName, setConfirmationName] = useState("");

  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const stringsMatch = (str1: string, str2: string): boolean => {
    return normalizeString(str1) === normalizeString(str2);
  };

  const deleteDialogTitle = "Excluir nota";
  const noteTitle = noteToDelete?.title ?? "Sem título";

  return (
    <FluriDialogV2 open={!!noteToDelete} onOpenChange={(open) => !open && onClose()}>
      <FluriDialogV2Content
        className="flex flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[420px]"
        showCloseButton={false}
        title={deleteDialogTitle}
        hideTitle
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center px-4 py-2">
          <div className="flex min-w-[44px] items-center justify-start">
            <BrandButton
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="ml-1 mt-2 bg-accent hover:bg-accent/80"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </BrandButton>
          </div>
          <div className="flex items-center justify-center px-2">
            <div className="truncate text-center text-base font-semibold text-foreground">
              {deleteDialogTitle}
            </div>
          </div>
          <div className="flex min-w-[44px] items-center justify-end">
            <BrandButton
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="mr-1 mt-2 bg-accent hover:bg-accent/80"
              aria-label="Fechar"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </BrandButton>
          </div>
        </div>

        <div className="px-5 py-6">
          <p className="text-sm text-muted-foreground mb-4">
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a nota{" "}
            <span className="font-medium text-foreground">{noteTitle}</span>.
          </p>
          <div className="space-y-2">
            <FluriFieldV2Input
              label={`Digite ${noteTitle} para confirmar`}
              value={confirmationName}
              onValueChange={setConfirmationName}
              placeholder={noteTitle}
              autoComplete="off"
              showClearButton={false}
              fullWidth
            />
          </div>
        </div>

        {isMobile ? (
          <FluriDialogV2Footer className="px-5 pb-5 pt-2">
            <BrandButton variant="ghost" onClick={onClose} disabled={isDeleting}>
              Cancelar
            </BrandButton>
            <BrandButton
              variant="destructive"
              onClick={onDelete}
              disabled={!stringsMatch(confirmationName, noteTitle) || isDeleting}
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Excluir"}
            </BrandButton>
          </FluriDialogV2Footer>
        ) : (
          <FluriDialogV2Footer className="grid grid-cols-3 items-center px-4 pb-2 pt-1">
            <div />
            <div />
            <div className="mr-1 mb-2 flex items-center justify-end gap-2">
              <BrandButton variant="ghost" onClick={onClose} disabled={isDeleting}>
                Cancelar
              </BrandButton>
              <BrandButton
                variant="destructive"
                onClick={onDelete}
                disabled={!stringsMatch(confirmationName, noteTitle) || isDeleting}
              >
                {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Excluir"}
              </BrandButton>
            </div>
          </FluriDialogV2Footer>
        )}
      </FluriDialogV2Content>
    </FluriDialogV2>
  );
}
