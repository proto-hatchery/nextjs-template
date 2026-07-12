"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { ResponsiveModal } from "@workspace/brand/overlays/responsive-modal";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface RegenerationWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: () => void;
  existingEvolutionId: string;
}

export function RegenerationWarningDialog({
  isOpen,
  onClose,
  onRegenerate,
  existingEvolutionId,
}: RegenerationWarningDialogProps) {
  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Evolução já gerada"
      description="Uma evolução clínica já foi gerada para esta nota. O que você deseja fazer?"
      className="sm:max-w-[440px]"
      footer={
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <BrandButton variant="ghost" size="md" asChild onClick={onClose}>
            <Link href={`/notes/${existingEvolutionId}`}>Ver Evolução</Link>
          </BrandButton>
          <BrandButton variant="default" size="md" onClick={onRegenerate}>
            Gerar Novamente
          </BrandButton>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center py-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 mb-2">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
      </div>
    </ResponsiveModal>
  );
}
