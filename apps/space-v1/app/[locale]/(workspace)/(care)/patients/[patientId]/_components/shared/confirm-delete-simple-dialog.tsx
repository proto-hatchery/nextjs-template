"use client";

import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Footer,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { Loader2 } from "lucide-react";

interface ConfirmDeleteSimpleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
}

/** Dialog simples de confirmação de exclusão (sem digitar para confirmar). Usar para itens de baixa criticidade. */
export function ConfirmDeleteSimpleDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isDeleting = false,
}: ConfirmDeleteSimpleDialogProps) {
  const isMobile = useIsMobile();

  const handleConfirm = () => {
    void Promise.resolve(onConfirm()).then(() => {
      onOpenChange(false);
    });
  };

  const handleClose = () => {
    if (!isDeleting) onOpenChange(false);
  };

  return (
    <FluriDialogV2 open={open} onOpenChange={handleClose}>
      <FluriDialogV2Content
        className="flex flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[420px]"
        showCloseButton={false}
        title={title}
        hideTitle
      >
        <div className="px-5 pt-5 pb-2">
          <h2 className="text-base font-semibold text-foreground text-left">{title}</h2>
        </div>

        <div className="px-5 pt-1 pb-6">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {isMobile ? (
          <FluriDialogV2Footer className="px-5 pb-5 pt-2">
            <BrandButton variant="ghost" onClick={handleClose} disabled={isDeleting}>
              Cancelar
            </BrandButton>
            <BrandButton variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Excluir"}
            </BrandButton>
          </FluriDialogV2Footer>
        ) : (
          <FluriDialogV2Footer className="grid grid-cols-3 items-center px-4 pb-2 pt-1">
            <div />
            <div />
            <div className="mr-1 mb-2 flex items-center justify-end gap-2">
              <BrandButton variant="ghost" onClick={handleClose} disabled={isDeleting}>
                Cancelar
              </BrandButton>
              <BrandButton variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Excluir"}
              </BrandButton>
            </div>
          </FluriDialogV2Footer>
        )}
      </FluriDialogV2Content>
    </FluriDialogV2>
  );
}
