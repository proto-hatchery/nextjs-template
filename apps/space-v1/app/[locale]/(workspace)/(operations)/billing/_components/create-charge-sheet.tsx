"use client";

import {
  FluriFormDialogFooter,
  FluriFormDialogShell,
} from "@workspace/brand/overlays/fluri-form-dialog-shell";

interface CreateChargeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedPatientId?: string;
}

export function CreateChargeSheet({
  open,
  onOpenChange,
  preSelectedPatientId: _preSelectedPatientId,
}: CreateChargeSheetProps) {
  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Cobranças automáticas"
      onClose={() => onOpenChange(false)}
      className="sm:max-w-[420px]"
    >
      <div className="px-5 py-4 text-sm text-muted-foreground">
        As cobranças não podem mais ser criadas manualmente. Elas são geradas automaticamente a
        partir das sessões faturáveis dentro da janela de cobrança.
      </div>
      <FluriFormDialogFooter
        onCancel={() => onOpenChange(false)}
        onSubmit={() => onOpenChange(false)}
        cancelLabel="Fechar"
        submitLabel="Entendi"
      />
    </FluriFormDialogShell>
  );
}
