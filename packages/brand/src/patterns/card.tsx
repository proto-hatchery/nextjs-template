"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Card as ShadcnCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

const cardVariants = cva("rounded-xl border bg-card text-card-foreground shadow", {
  variants: {
    variant: {
      default: "",
      flat: "border-transparent bg-muted shadow-none",
      outline: "bg-transparent shadow-none",
      ghost: "border-transparent bg-transparent shadow-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends React.ComponentProps<typeof ShadcnCard>, VariantProps<typeof cardVariants> {}

/**
 * Card customizado do Fluri com variantes adicionais.
 *
 * Extensão do Card do shadcn/ui com as variants:
 * - `flat`: Card sem borda e sem shadow, com fundo muted
 * - `outline`: Card transparente apenas com borda
 * - `ghost`: Card totalmente transparente
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Default</CardTitle>
 *   </CardHeader>
 *   <CardContent>Content</CardContent>
 * </Card>
 *
 * <Card variant="flat">
 *   <CardContent>Flat card</CardContent>
 * </Card>
 * ```
 */
function Card({ variant = "default", className, ...props }: CardProps) {
  return <ShadcnCard className={cn(cardVariants({ variant }), className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants };
