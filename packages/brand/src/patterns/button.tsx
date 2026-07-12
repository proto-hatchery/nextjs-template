"use client";

import * as React from "react";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";

export interface ButtonProps extends React.ComponentProps<typeof BrandButton> {
  loading?: boolean;
}

/**
 * Button customizado do Fluri com suporte a loading state.
 *
 * Este componente estende o Button original do shadcn/ui,
 * adicionando a prop `loading` para mostrar um spinner e
 * desabilitar o botão automaticamente.
 *
 * @example
 * ```tsx
 * <BrandButton>Normal</BrandButton>
 * <BrandButton loading>Salvando...</BrandButton>
 * <BrandButton loading disabled>Desabilitado e carregando</BrandButton>
 * ```
 */
function Button({ loading = false, children, disabled, className, ...props }: ButtonProps) {
  return (
    <BrandButton
      disabled={loading || disabled}
      className={cn("cursor-pointer gap-2", loading && "opacity-80", className)}
      {...props}
    >
      {loading && <Spinner className="size-4 shrink-0" />}
      {children}
    </BrandButton>
  );
}

export { Button };
