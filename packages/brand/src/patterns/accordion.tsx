"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import {
  Accordion as ShadcnAccordion,
  AccordionContent,
  AccordionItem,
} from "@workspace/ui/components/accordion";
import { cn } from "@workspace/ui/lib/utils";

export interface AccordionTriggerProps extends React.ComponentProps<
  typeof AccordionPrimitive.Trigger
> {
  hideChevron?: boolean;
}

/**
 * Custom accordion trigger with an option to hide the trailing chevron.
 *
 * @example
 * ```tsx
 * <AccordionTrigger>With chevron</AccordionTrigger>
 * <AccordionTrigger hideChevron>Without chevron</AccordionTrigger>
 * ```
 */
function AccordionTrigger({
  className,
  children,
  hideChevron = false,
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
          !hideChevron && "[&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        {!hideChevron ? (
          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
        ) : null}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * Fluri accordion wrapper.
 *
 * Wraps the shadcn accordion and exposes a custom trigger
 * that supports the `hideChevron` prop.
 *
 * @example
 * ```tsx
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Trigger with chevron</AccordionTrigger>
 *     <AccordionContent>Content</AccordionContent>
 *   </AccordionItem>
 *   <AccordionItem value="item-2">
 *     <AccordionTrigger hideChevron>Trigger without chevron</AccordionTrigger>
 *     <AccordionContent>Content</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
const Accordion = ShadcnAccordion;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
