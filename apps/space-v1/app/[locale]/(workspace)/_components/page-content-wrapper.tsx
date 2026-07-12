import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

interface PageContentWrapperProps {
  /**
   * Conteúdo a ser envolvido com padding padronizado
   */
  children: ReactNode;

  /**
   * Classes CSS adicionais
   */
  className?: string;
}

/**
 * Wrapper para conteúdo dentro de PageContentHeader.
 *
 * Aplica o padrão padronizado de:
 * - Padding responsivo: px-4 sm:px-6 lg:px-8 py-6
 * - Conteúdo de ponta a ponta (sem limitação de largura máxima)
 *
 * @example
 * <PageContentHeader breadcrumbs={...}>
 *   <div className="h-full overflow-y-auto">
 *     <PageContentWrapper>
 *       Seu conteúdo aqui
 *     </PageContentWrapper>
 *   </div>
 * </PageContentHeader>
 */
export function PageContentWrapper({ children, className }: PageContentWrapperProps) {
  return <div className={cn("px-4 sm:px-6 lg:px-8 py-0 md:py-6", className)}>{children}</div>;
}
