"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden";
import { cn } from "@workspace/ui/lib/utils";

interface FluriDialogV2Props extends React.ComponentProps<typeof Dialog> {
  closable?: boolean | undefined;
}

interface FluriDialogV2ContextType {
  closable: boolean;
  shake: boolean;
  triggerShake: () => void;
}

const FluriDialogV2Context = React.createContext<FluriDialogV2ContextType>({
  closable: true,
  shake: false,
  triggerShake: () => {},
});

const useFluriDialogV2 = () => React.useContext(FluriDialogV2Context);

const FluriDialogV2 = ({
  closable = true,
  onOpenChange,
  children,
  ...props
}: FluriDialogV2Props) => {
  const [shake, setShake] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  const triggerShake = React.useCallback(() => {
    setShake(true);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => setShake(false), 500);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open && !closable) {
      triggerShake();
      return;
    }
    onOpenChange?.(open);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} {...props}>
      <FluriDialogV2Context.Provider value={{ closable, shake, triggerShake }}>
        {children}
      </FluriDialogV2Context.Provider>
    </Dialog>
  );
};

type FluriDialogV2ContentProps = React.ComponentPropsWithoutRef<typeof DialogContent> & {
  title?: string | undefined;
  description?: string | undefined;
  hideTitle?: boolean | undefined;
};

const FluriDialogV2Content = React.forwardRef<HTMLDivElement, FluriDialogV2ContentProps>(
  (
    {
      className,
      children,
      title,
      description,
      hideTitle = false,
      onInteractOutside,
      onEscapeKeyDown,
      onOpenAutoFocus,
      showCloseButton,
      tabIndex,
      ...props
    },
    ref,
  ) => {
    const { closable, shake, triggerShake } = useFluriDialogV2();
    const contentRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      if (!contentRef.current || !shake) {
        return;
      }

      const element = contentRef.current;
      const animation = [
        { transform: "translateX(0px)" },
        { transform: "translateX(-10px)" },
        { transform: "translateX(10px)" },
        { transform: "translateX(-10px)" },
        { transform: "translateX(10px)" },
        { transform: "translateX(0px)" },
      ];

      element.animate(animation, {
        duration: 400,
        easing: "ease-in-out",
      });
    }, [shake]);

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        contentRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const resolvedShowCloseButton = showCloseButton ?? closable;

    // Header with title and description for accessibility
    const accessibleHeader = title ? (
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
    ) : null;

    // Fallback title when no title provided but accessibility is needed
    const fallbackTitle = !title && hideTitle ? <DialogTitle>Dialog</DialogTitle> : null;

    return (
      <DialogContent
        ref={setRefs}
        className={cn(
          "[&_input:focus]:ring-inset [&_input:focus-visible]:ring-inset [&_select:focus]:ring-inset [&_select:focus-visible]:ring-inset [&_textarea:focus]:ring-inset [&_textarea:focus-visible]:ring-inset [&_button:focus-visible]:ring-inset",
          className,
        )}
        showCloseButton={resolvedShowCloseButton}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          if (event.defaultPrevented) {
            return;
          }
          if (!closable) {
            event.preventDefault();
            triggerShake();
          }
        }}
        onEscapeKeyDown={(event) => {
          onEscapeKeyDown?.(event);
          if (event.defaultPrevented) {
            return;
          }
          if (!closable) {
            event.preventDefault();
            triggerShake();
          }
        }}
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event);
          if (event.defaultPrevented) {
            return;
          }

          event.preventDefault();

          window.requestAnimationFrame(() => {
            const element = contentRef.current;
            if (!element) return;

            const explicitFocusTarget = element.querySelector<HTMLElement>(
              "[data-dialog-initial-focus='true']",
            );
            if (explicitFocusTarget) {
              explicitFocusTarget.focus();
              return;
            }

            element.focus();
          });
        }}
        tabIndex={tabIndex ?? -1}
        {...props}
      >
        {/* Render header - visually hidden when hideTitle is true */}
        {accessibleHeader &&
          (hideTitle ? (
            <VisuallyHiddenPrimitive.Root>{accessibleHeader}</VisuallyHiddenPrimitive.Root>
          ) : (
            accessibleHeader
          ))}

        {/* Fallback title for accessibility when no title provided */}
        {fallbackTitle && (
          <VisuallyHiddenPrimitive.Root>{fallbackTitle}</VisuallyHiddenPrimitive.Root>
        )}

        {children}
      </DialogContent>
    );
  },
);
FluriDialogV2Content.displayName = "FluriDialogV2Content";

const FluriDialogV2Footer = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogFooter>) => {
  return (
    <DialogFooter
      className={cn("[&_[data-slot=button]]:rounded-full [&_button]:rounded-full", className)}
      {...props}
    />
  );
};
FluriDialogV2Footer.displayName = "FluriDialogV2Footer";

export {
  FluriDialogV2,
  FluriDialogV2Content,
  DialogTrigger as FluriDialogV2Trigger,
  DialogHeader as FluriDialogV2Header,
  DialogTitle as FluriDialogV2Title,
  DialogDescription as FluriDialogV2Description,
  FluriDialogV2Footer,
  DialogClose as FluriDialogV2Close,
};
