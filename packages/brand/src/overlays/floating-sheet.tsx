"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

function FloatingSheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function FloatingSheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function FloatingSheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function FloatingSheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function FloatingSheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/20 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

type FloatingSheetContentProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
  ref?: React.Ref<React.ElementRef<typeof SheetPrimitive.Content>>;
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
};

function FloatingSheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ref,
  ...props
}: FloatingSheetContentProps) {
  return (
    <FloatingSheetPortal>
      <FloatingSheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        ref={ref}
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-0 shadow-2xl transition ease-in-out data-[state=closed]:duration-500 data-[state=open]:duration-700 focus:outline-none overflow-hidden p-0",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-3 right-3 h-[calc(100%-24px)] w-3/4 border sm:max-w-sm rounded-3xl",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-3 left-3 h-[calc(100%-24px)] w-3/4 border sm:max-w-sm rounded-3xl",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-3 top-3 h-auto border rounded-3xl",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-3 bottom-3 h-auto border rounded-3xl",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 z-50 rounded-full p-2 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none hover:bg-muted bg-background"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </FloatingSheetPortal>
  );
}

type FloatingSheetHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

function FloatingSheetHeader({ className, ref, ...props }: FloatingSheetHeaderProps) {
  return (
    <div
      ref={ref}
      data-slot="sheet-header"
      className={cn("flex flex-col space-y-1 px-6 py-4 bg-background sticky top-0 z-10", className)}
      {...props}
    />
  );
}
FloatingSheetHeader.displayName = "FloatingSheetHeader";

type FloatingSheetFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

function FloatingSheetFooter({ className, ref, ...props }: FloatingSheetFooterProps) {
  return (
    <div
      ref={ref}
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-row items-center justify-end gap-2 px-5 py-4 bg-muted",
        className,
      )}
      {...props}
    />
  );
}
FloatingSheetFooter.displayName = "FloatingSheetFooter";

function FloatingSheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-medium text-xl tracking-tight pr-8", className)}
      {...props}
    />
  );
}

function FloatingSheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  FloatingSheet,
  FloatingSheetClose,
  FloatingSheetContent,
  FloatingSheetDescription,
  FloatingSheetFooter,
  FloatingSheetHeader,
  FloatingSheetTitle,
  FloatingSheetTrigger,
};
