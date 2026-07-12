"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { AlertCircle, Loader2, type LucideIcon } from "lucide-react";

interface PatientDetailCardEmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

/** Estado vazio padronizado para cards no detalhe do paciente. Flat design, sem borda, bg-muted/20. Sem botões de ação. */
export function PatientDetailCardEmptyState({
  icon: Icon,
  title,
  subtitle,
}: PatientDetailCardEmptyStateProps) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl bg-muted/20 py-8 text-center">
      <Icon className="size-10 text-muted-foreground/40 mb-2" />
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground/80">{subtitle}</p>
    </div>
  );
}

interface PatientDetailCardLoadingStateProps {
  message?: string;
}

/** Estado de carregamento padronizado. Flat design, sem borda, bg-muted/20. */
export function PatientDetailCardLoadingState({
  message = "Carregando...",
}: PatientDetailCardLoadingStateProps) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl bg-muted/20 p-8">
      <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface PatientDetailCardErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/** Estado de erro padronizado. Flat design, sem borda, bg-muted/20. */
export function PatientDetailCardErrorState({
  message = "Não foi possível carregar os dados.",
  onRetry,
}: PatientDetailCardErrorStateProps) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl bg-muted/20 p-8">
      <AlertCircle className="size-6 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <BrandButton variant="ghost" size="sm" onClick={onRetry}>
          Tentar novamente
        </BrandButton>
      ) : null}
    </div>
  );
}
