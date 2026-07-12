"use client";

import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

/* -----------------------------------------------------------------------------
 * PatientDetailCardDeleteButton
 * Botão excluir reutilizável. Só renderiza quando onClick é fornecido.
 * ----------------------------------------------------------------------------- */

export interface PatientDetailCardDeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function PatientDetailCardDeleteButton({
  onClick,
  disabled,
  ariaLabel = "Excluir",
}: PatientDetailCardDeleteButtonProps) {
  return (
    <BrandButton
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <Trash2 className="size-4" />
    </BrandButton>
  );
}

/* -----------------------------------------------------------------------------
 * PatientDetailCardItemActions
 * Barra de ações (editar, excluir, custom) para itens de card.
 * Cada botão é ativado pela prop correspondente (ex: onDelete ativa o botão excluir).
 * ----------------------------------------------------------------------------- */

export interface PatientDetailCardItemActionsProps {
  /** Quando fornecido, exibe o botão de editar */
  onEdit?: () => void;
  /** Quando fornecido, exibe o botão de excluir */
  onDelete?: () => void;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  editAriaLabel?: string;
  deleteAriaLabel?: string;
  /** Botões adicionais (Download, Sparkles, etc.) */
  children?: ReactNode;
  /** Chamado no wrapper para stopPropagation em rows clicáveis */
  stopPropagation?: boolean;
}

export function PatientDetailCardItemActions({
  onEdit,
  onDelete,
  editDisabled,
  deleteDisabled,
  editAriaLabel = "Editar",
  deleteAriaLabel = "Excluir",
  children,
  stopPropagation = true,
}: PatientDetailCardItemActionsProps) {
  const handleClick = (e: React.MouseEvent, fn?: () => void) => {
    if (stopPropagation) e.stopPropagation();
    fn?.();
  };

  return (
    <div
      className="flex items-center gap-1"
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      {children}
      {onEdit ? (
        <BrandButton
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:bg-background/80 hover:text-foreground"
          onClick={(e) => handleClick(e, onEdit)}
          disabled={editDisabled}
          aria-label={editAriaLabel}
        >
          <Pencil className="size-4" />
        </BrandButton>
      ) : null}
      {onDelete ? (
        <BrandButton
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => handleClick(e, onDelete)}
          disabled={deleteDisabled}
          aria-label={deleteAriaLabel}
        >
          <Trash2 className="size-4" />
        </BrandButton>
      ) : null}
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * PatientDetailCardItem
 * Card item padronizado (flat design, sem borda, bg-muted/40).
 * Usa ícone, conteúdo e actions como slots.
 * ----------------------------------------------------------------------------- */

export interface PatientDetailCardItemProps {
  icon: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  /** Torna a linha clicável (adiciona cursor-pointer e role) */
  onClick?: () => void;
  className?: string;
}

export function PatientDetailCardItem({
  icon,
  children,
  actions,
  onClick,
  className,
}: PatientDetailCardItemProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        "group flex items-center justify-between gap-4 rounded-2xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60",
        isClickable && "cursor-pointer",
        className,
      )}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className="flex min-w-0 flex-1 items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/80 mr-3 shadow-sm text-muted-foreground">
          {icon}
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {actions ? <div className="shrink-0 ml-2">{actions}</div> : null}
    </div>
  );
}
