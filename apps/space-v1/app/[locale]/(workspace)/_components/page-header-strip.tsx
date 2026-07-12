"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

import { PageSection } from "./layout/page-section";
import { PageSectionFullBleed } from "./layout/page-section-full-bleed";

interface PageHeaderStripProps {
  children: ReactNode;
  /**
   * Torna o header sticky. Blur acompanha o sticky por padrão.
   */
  sticky?: boolean;
  /**
   * Controla o blur do fundo. Útil quando o header não é sticky, mas ainda precisa de blur.
   */
  withBackdropBlur?: boolean;
  /**
   * Estilos adicionais no wrapper full-bleed.
   */
  className?: string;
}

/**
 * Wrapper padrão para headers de página com largura total, borda e fundo unificados.
 * Sempre sticky para garantir que o header fique fixo no topo e o conteúdo scroll por baixo.
 * Garante altura consistente porque o espaçamento vertical fica a cargo do StandardPageHeader.
 */
export function PageHeaderStrip({
  children,
  sticky = true,
  withBackdropBlur = sticky,
  className,
}: PageHeaderStripProps) {
  return (
    <PageSectionFullBleed
      sticky={sticky}
      withBackdropBlur={withBackdropBlur}
      className={cn(
        "hidden md:block border-b border-border/50 bg-background/95 shrink-0",
        className,
      )}
    >
      <PageSection withPadding={false}>{children}</PageSection>
    </PageSectionFullBleed>
  );
}
