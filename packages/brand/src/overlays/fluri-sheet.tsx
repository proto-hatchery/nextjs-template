"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@workspace/ui/components/sheet";

interface FluriSheetProps extends React.ComponentProps<typeof Sheet> {
  closable?: boolean;
}

const FluriSheet = ({ closable = true, onOpenChange, children, ...props }: FluriSheetProps) => {
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
    <Sheet onOpenChange={handleOpenChange} {...props}>
      <FluriSheetContext.Provider value={{ closable, shake, triggerShake }}>
        {children}
      </FluriSheetContext.Provider>
    </Sheet>
  );
};

interface FluriSheetContextType {
  closable: boolean;
  shake: boolean;
  triggerShake: () => void;
}

const FluriSheetContext = React.createContext<FluriSheetContextType>({
  closable: true,
  shake: false,
  triggerShake: () => {},
});

const useFluriSheet = () => React.useContext(FluriSheetContext);

type FluriSheetContentProps = React.ComponentPropsWithoutRef<typeof SheetContent> & {
  ref?: React.Ref<HTMLDivElement>;
};

const FluriSheetContent = ({ className, children, ref, ...props }: FluriSheetContentProps) => {
  const { closable, shake, triggerShake } = useFluriSheet();
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  // Apply shake animation directly to the sheet content element
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
    <SheetContent
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
      {children}
    </SheetContent>
  );
};
FluriSheetContent.displayName = "FluriSheetContent";

export {
  FluriSheet,
  FluriSheetContent,
  SheetTrigger as FluriSheetTrigger,
  SheetHeader as FluriSheetHeader,
  SheetTitle as FluriSheetTitle,
  SheetDescription as FluriSheetDescription,
  SheetFooter as FluriSheetFooter,
  SheetClose as FluriSheetClose,
};
