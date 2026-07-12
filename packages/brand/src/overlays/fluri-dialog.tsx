"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@workspace/ui/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface FluriDialogProps extends React.ComponentProps<typeof Dialog> {
  closable?: boolean;
}

const FluriDialog = ({ closable = true, onOpenChange, children, ...props }: FluriDialogProps) => {
  const [shake, setShake] = React.useState(false);

  const triggerShake = React.useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
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
      <FluriDialogContext.Provider value={{ closable, shake, triggerShake }}>
        {children}
      </FluriDialogContext.Provider>
    </Dialog>
  );
};

interface FluriDialogContextType {
  closable: boolean;
  shake: boolean;
  triggerShake: () => void;
}

const FluriDialogContext = React.createContext<FluriDialogContextType>({
  closable: true,
  shake: false,
  triggerShake: () => {},
});

const useFluriDialog = () => React.useContext(FluriDialogContext);

type FluriDialogContentProps = React.ComponentPropsWithoutRef<typeof DialogContent> & {
  ref?: React.Ref<HTMLDivElement>;
};

const FluriDialogContent = ({
  className,
  children,
  ref,
  title,
  description,
  hideTitle = false,
  ...props
}: FluriDialogContentProps & { title?: string; description?: string; hideTitle?: boolean }) => {
  const { closable, shake, triggerShake } = useFluriDialog();
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  // Apply shake animation directly to the dialog content element
  React.useEffect(() => {
    if (!contentRef.current) return;

    const element = contentRef.current;

    if (shake) {
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
    }
  }, [shake]);

  // Set ref callback to capture the actual DOM element
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      contentRef.current = node;
    },
    [ref],
  );

  return (
    <DialogContent
      ref={setRefs}
      className={className}
      showCloseButton={closable}
      onInteractOutside={(e) => {
        if (!closable) {
          e.preventDefault();
          triggerShake();
        }
      }}
      onEscapeKeyDown={(e) => {
        if (!closable) {
          e.preventDefault();
          triggerShake();
        }
      }}
      {...props}
    >
      {title && (
        <div className={hideTitle ? "sr-only" : ""}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        </div>
      )}
      {!title && hideTitle && (
        <VisuallyHidden>
          <DialogTitle>Dialog</DialogTitle>
        </VisuallyHidden>
      )}
      {children}
    </DialogContent>
  );
};
FluriDialogContent.displayName = "FluriDialogContent";

export {
  FluriDialog,
  FluriDialogContent,
  DialogTrigger as FluriDialogTrigger,
  DialogHeader as FluriDialogHeader,
  DialogTitle as FluriDialogTitle,
  DialogDescription as FluriDialogDescription,
  DialogFooter as FluriDialogFooter,
  DialogClose as FluriDialogClose,
};
