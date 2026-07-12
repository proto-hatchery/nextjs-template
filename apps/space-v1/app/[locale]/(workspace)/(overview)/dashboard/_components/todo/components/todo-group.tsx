import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import type * as React from "react";

interface TodoGroupProps {
  label: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function TodoGroup({ label, count, isOpen, onToggle, children }: TodoGroupProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="bg-background/95 sticky top-0 z-10 -mx-1 px-1 py-1 text-[13px] font-medium backdrop-blur">
        <CollapsibleTrigger asChild>
          <BrandButton
            variant="ghost"
            className="group flex w-full items-center justify-between outline-none h-auto justify-between"
            aria-expanded={isOpen}
          >
            <span className="inline-flex items-center gap-1.5">
              <motion.span
                initial={false}
                animate={{ rotate: isOpen ? 0 : -90 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="inline-flex"
              >
                <ChevronDown
                  className="text-muted-foreground group-hover:text-foreground h-3 w-3 transition-colors"
                  aria-hidden
                />
              </motion.span>
              <span className="text-foreground">{label}</span>
              <span className="text-muted-foreground text-xs">{count}</span>
            </span>
          </BrandButton>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent forceMount className="overflow-hidden">
        <motion.div
          initial={false}
          animate={isOpen ? "open" : "closed"}
          variants={{
            open: {
              opacity: 1,
              y: 0,
              height: "auto",
              paddingTop: 4,
              clipPath: "inset(0% 0% 0% 0%)",
              transition: { duration: 0.22, ease: [0.22, 0.8, 0.2, 1] },
            },
            closed: {
              opacity: 0,
              y: -8,
              height: 0,
              paddingTop: 0,
              clipPath: "inset(0% 0% 100% 0%)",
              transition: { duration: 0.16, ease: [0.4, 0.0, 0.2, 1] },
            },
          }}
          className="will-change-[transform,opacity,clip-path,height]"
        >
          {children}
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}
