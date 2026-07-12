"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import {
  FloatingSheet,
  FloatingSheetContent,
  FloatingSheetDescription,
  FloatingSheetFooter,
  FloatingSheetHeader,
  FloatingSheetTitle,
  FloatingSheetTrigger,
  FloatingSheetClose,
} from "./floating-sheet";

interface FluriFloatingSheetProps {
  children?: React.ReactNode;
  closable?: boolean;
  defaultOpen?: boolean;
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

interface FluriFloatingSheetContextType {
  closable: boolean;
  shake: boolean;
  triggerShake: () => void;
}

const FluriFloatingSheetContext = React.createContext<FluriFloatingSheetContextType>({
  closable: true,
  shake: false,
  triggerShake: () => {},
});

const useFluriFloatingSheet = () => React.useContext(FluriFloatingSheetContext);

const FluriFloatingSheet = ({
  closable = true,
  onOpenChange,
  children,
  ...props
}: FluriFloatingSheetProps) => {
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
    <FloatingSheet onOpenChange={handleOpenChange} {...props}>
      <FluriFloatingSheetContext.Provider value={{ closable, shake, triggerShake }}>
        {children}
      </FluriFloatingSheetContext.Provider>
    </FloatingSheet>
  );
};

type FluriFloatingSheetContentProps = React.ComponentPropsWithoutRef<
  typeof FloatingSheetContent
> & {
  ref?: React.Ref<HTMLDivElement>;
};

const FluriFloatingSheetContent = ({
  className,
  children,
  ref,
  ...props
}: FluriFloatingSheetContentProps) => {
  const { closable, shake, triggerShake } = useFluriFloatingSheet();
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
    <FloatingSheetContent
      ref={setRefs}
      className={cn(
        "[&_input:focus]:ring-inset [&_input:focus-visible]:ring-inset [&_select:focus]:ring-inset [&_select:focus-visible]:ring-inset [&_textarea:focus]:ring-inset [&_textarea:focus-visible]:ring-inset [&_button:focus-visible]:ring-inset",
        className,
      )}
      showCloseButton={closable}
      onInteractOutside={(e: Event) => {
        if (!closable) {
          e.preventDefault();
          triggerShake();
        }
      }}
      onEscapeKeyDown={(e: KeyboardEvent) => {
        if (!closable) {
          e.preventDefault();
          triggerShake();
        }
      }}
      {...props}
    >
      {children}
    </FloatingSheetContent>
  );
};
FluriFloatingSheetContent.displayName = "FluriFloatingSheetContent";

export {
  FluriFloatingSheet,
  FluriFloatingSheetContent,
  FloatingSheetTrigger as FluriFloatingSheetTrigger,
  FloatingSheetHeader as FluriFloatingSheetHeader,
  FloatingSheetTitle as FluriFloatingSheetTitle,
  FloatingSheetDescription as FluriFloatingSheetDescription,
  FloatingSheetFooter as FluriFloatingSheetFooter,
  FloatingSheetClose as FluriFloatingSheetClose,
};
