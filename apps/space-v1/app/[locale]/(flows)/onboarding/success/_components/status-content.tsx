"use client";

import type { OnboardingSuccessStatus } from "../_types";

// ============================================================================
// Constants
// ============================================================================

const STATUS_TITLES: Record<OnboardingSuccessStatus, string> = {
  processing: "Processando pagamento...",
  activating: "Ativando sua assinatura...",
  ready: "Assinatura ativa!",
};

const STATUS_DESCRIPTIONS: Record<OnboardingSuccessStatus, string> = {
  processing: "Aguarde enquanto confirmamos seu pagamento.",
  activating: "Estamos preparando seu ambiente. Isso pode levar alguns segundos...",
  ready: "Redirecionando para o dashboard...",
};

// ============================================================================
// Title Component
// ============================================================================

interface StatusTitleProps {
  status: OnboardingSuccessStatus;
}

export function StatusTitle({ status }: StatusTitleProps) {
  return <h1 className="text-3xl font-semibold text-slate-900 mb-2">{STATUS_TITLES[status]}</h1>;
}

// ============================================================================
// Description Component
// ============================================================================

interface StatusDescriptionProps {
  status: OnboardingSuccessStatus;
}

export function StatusDescription({ status }: StatusDescriptionProps) {
  return <p className="text-slate-500">{STATUS_DESCRIPTIONS[status]}</p>;
}
