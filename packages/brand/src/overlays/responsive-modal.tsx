"use client";

import * as React from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import {
  FluriFloatingSheet,
  FluriFloatingSheetContent,
  FluriFloatingSheetHeader,
  FluriFloatingSheetTitle,
  FluriFloatingSheetFooter,
} from "./fluri-floating-sheet";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { cn } from "@workspace/ui/lib/utils";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  closeOnInteractOutside?: boolean;
}

export function ResponsiveModal({
  children,
  open,
  onOpenChange,
  title,
  description,
  footer,
  className,
  showHeader = true,
  closeOnInteractOutside = true,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  // Mobile: Bottom Sheet with handlebar
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "p-0 pb-safe rounded-t-3xl border-t bg-background flex flex-col max-h-[90vh]",
            className,
          )}
          {...(!closeOnInteractOutside
            ? { onInteractOutside: (e: { preventDefault: () => void }) => e.preventDefault() }
            : {})}
          showCloseButton={false}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-4">
            <div className="w-9 h-1 bg-border/60 rounded-full" />
          </div>

          {showHeader && (
            <SheetHeader className="px-6 pb-2 text-center">
              {title && (
                <SheetTitle className="text-[17px] font-semibold text-foreground leading-tight">
                  {title}
                </SheetTitle>
              )}
              {description && (
                <SheetDescription className="text-[13px] text-muted-foreground mt-1">
                  {description}
                </SheetDescription>
              )}
            </SheetHeader>
          )}
          {!showHeader && title && (
            <VisuallyHidden.Root>
              <SheetTitle>{title}</SheetTitle>
            </VisuallyHidden.Root>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-2">{children}</div>

          {footer && (
            <div className="px-4 pb-4 mt-auto">
              <div className="bg-muted/50 rounded-xl overflow-hidden p-3">{footer}</div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Side Sheet (Floating Drawer)
  return (
    <FluriFloatingSheet open={open} onOpenChange={onOpenChange} closable={true}>
      <FluriFloatingSheetContent
        className={cn("w-[400px] sm:w-[480px] p-0 flex flex-col", className)}
        {...(!closeOnInteractOutside
          ? { onInteractOutside: (e: { preventDefault: () => void }) => e.preventDefault() }
          : {})}
      >
        {showHeader && (
          <FluriFloatingSheetHeader className="px-6 py-4 border-b border-border/40">
            {title && <FluriFloatingSheetTitle>{title}</FluriFloatingSheetTitle>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </FluriFloatingSheetHeader>
        )}
        {!showHeader && title && (
          <VisuallyHidden.Root>
            <FluriFloatingSheetTitle>{title}</FluriFloatingSheetTitle>
          </VisuallyHidden.Root>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

        {footer && (
          <FluriFloatingSheetFooter className="px-6 py-4 border-t border-border/40">
            {footer}
          </FluriFloatingSheetFooter>
        )}
      </FluriFloatingSheetContent>
    </FluriFloatingSheet>
  );
}
