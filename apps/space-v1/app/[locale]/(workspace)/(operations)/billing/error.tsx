"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";

interface BillingErrorProps {
  reset: () => void;
}

export default function BillingError({ reset }: BillingErrorProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-lg font-semibold">Erro ao carregar cobranças</h2>
      <p className="text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
      <BrandButton onClick={reset} variant="neutral" size="small">
        Tentar novamente
      </BrandButton>
    </div>
  );
}
