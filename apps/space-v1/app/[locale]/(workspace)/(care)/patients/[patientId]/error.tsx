"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";

interface PatientDetailErrorProps {
  reset: () => void;
}

export default function PatientDetailError({ reset }: PatientDetailErrorProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-lg font-semibold">Erro ao carregar paciente</h2>
      <p className="text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
      <BrandButton onClick={reset} variant="neutral" size="sm">
        Tentar novamente
      </BrandButton>
    </div>
  );
}
