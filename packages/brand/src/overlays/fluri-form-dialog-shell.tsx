"use client";

import * as React from "react";
import { ArrowLeft, X, Loader2 } from "lucide-react";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { FluriDialogV2, FluriDialogV2Content, FluriDialogV2Footer } from "./fluri-dialog-v2";
import { cn } from "@workspace/ui/lib/utils";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";

interface FluriFormDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Descrição acessível para leitores de tela (aria-describedby) */
  description?: string;
  /** Quando true, não exibe o header (título + botão fechar). Use em wizards que já têm navegação própria. */
  hideHeader?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * A standard shell for form dialogs in Fluri.
 * Encapsulates the standard header with back button, title, and close button.
 */
export function FluriFormDialogShell({
  open,
  onOpenChange,
  title,
  description,
  hideHeader = false,
  showBackButton = false,
  onBack,
  onClose,
  children,
  className,
  contentClassName,
}: FluriFormDialogShellProps) {
  return (
    <FluriDialogV2 open={open} onOpenChange={onOpenChange}>
      <FluriDialogV2Content
        className={cn(
          "flex flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[420px]",
          className,
        )}
        showCloseButton={false}
        title={title}
        description={description}
        hideTitle
      >
        {!hideHeader && (
          <div className="grid grid-cols-[auto_1fr_auto] items-center px-4 py-2">
            <div className="flex min-w-[44px] items-center justify-start">
              {showBackButton && (
                <BrandButton
                  variant="ghost"
                  size="icon-lg"
                  onClick={onBack}
                  className="ml-1 mt-2 rounded-full bg-accent hover:bg-accent/80"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </BrandButton>
              )}
            </div>
            <div className="flex items-center justify-center px-2">
              <div className="truncate text-center text-base font-semibold text-foreground">
                {title}
              </div>
            </div>
            <div className="flex min-w-[44px] items-center justify-end">
              <BrandButton
                variant="ghost"
                size="icon-lg"
                onClick={onClose}
                className="mr-1 mt-2 rounded-full bg-accent hover:bg-accent/80"
                aria-label="Fechar"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </BrandButton>
            </div>
          </div>
        )}

        <div className={cn("relative flex-1 min-h-0", contentClassName)}>{children}</div>
      </FluriDialogV2Content>
    </FluriDialogV2>
  );
}

interface FluriFormDialogFooterProps {
  onCancel: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
  /** Use "destructive" for delete/remove actions */
  submitVariant?: "default" | "destructive";
}

/**
 * A responsive footer for form dialogs.
 * Handles mobile (stacked/full width) and desktop (grid/right-aligned) layouts.
 */
export function FluriFormDialogFooter({
  onCancel,
  onSubmit,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  isSubmitting = false,
  disabled = false,
  className,
  submitVariant = "default",
}: FluriFormDialogFooterProps) {
  const isMobile = useIsMobile();
  const submitBtn = (
    <BrandButton
      type="submit"
      variant={submitVariant === "destructive" ? "destructive" : "default"}
      onClick={onSubmit}
      disabled={isSubmitting || disabled}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Salvando...
        </>
      ) : (
        submitLabel
      )}
    </BrandButton>
  );

  if (isMobile) {
    return (
      <FluriDialogV2Footer className={cn("px-5 pb-5 pt-2", className)}>
        <BrandButton
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting || disabled}
        >
          {cancelLabel}
        </BrandButton>
        {submitBtn}
      </FluriDialogV2Footer>
    );
  }

  return (
    <FluriDialogV2Footer className={cn("grid grid-cols-3 items-center px-4 pb-2 pt-4", className)}>
      <div />
      <div />
      <div className="mb-2 mr-1 flex items-center justify-end gap-2">
        <BrandButton
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting || disabled}
        >
          {cancelLabel}
        </BrandButton>
        {submitBtn}
      </div>
    </FluriDialogV2Footer>
  );
}
