"use client";

import { cva } from "class-variance-authority";
import * as React from "react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

export type BrandButtonFamily = "default" | "rounded";
export type BrandButtonVariant =
  | "primary"
  | "secondary"
  | "neutral"
  | "destructive"
  | "outline"
  | "flat"
  | "ghost"
  | "nav"
  | "link"
  | "linkWhite"
  | "default";
export type BrandButtonSize =
  | "small"
  | "default"
  | "large"
  | "sm"
  | "md"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg"
  | "xs";

const brandVisualVariants = cva(
  "inline-flex w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors duration-300",
  {
    variants: {
      family: {
        default: "",
        rounded: "!rounded-full",
      },
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-secondary hover:text-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        neutral: "bg-muted text-muted-foreground hover:bg-muted/70",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline:
          "border-2 border-border bg-transparent shadow-xs hover:border-muted-foreground/60 transition-colors dark:border-input dark:hover:border-muted-foreground/60",
        flat: "bg-muted text-muted-foreground hover:bg-muted/80",
        ghost: "bg-transparent text-foreground hover:bg-accent/50 hover:text-foreground",
        nav: "bg-transparent text-foreground hover:bg-accent hover:text-foreground",
        link: "",
        linkWhite: "",
        default: "bg-primary text-primary-foreground hover:bg-secondary hover:text-primary",
      },
      size: {
        small: "px-3 py-1.5 text-[14px]",
        default: "px-4 py-2 text-[16px]",
        large: "px-8 py-3 text-[18px]",
        icon: "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        xs: "px-2 py-1 text-[12px]",
      },
    },
    compoundVariants: [
      // Family Rounded: Always full rounded and keep original proportions (no fixed height)
      {
        family: "rounded",
        className: "!rounded-full",
      },
      // Fluri Special Styling (Rounded Family + Primary/Default Variant)
      {
        family: "rounded",
        variant: ["primary", "default"],
        className: "hover:bg-secondary hover:text-primary",
      },
      // Link variant (same for both families)
      {
        variant: "link",
        className:
          "relative rounded-none bg-transparent p-0 text-primary leading-[11px] tracking-[-0.32px] after:pointer-events-none after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:scale-[102%] hover:after:scale-x-100",
      },
      {
        variant: "linkWhite",
        className:
          "relative rounded-none bg-transparent p-0 text-white leading-[11px] tracking-[-0.32px] after:pointer-events-none after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:scale-[102%] hover:after:scale-x-100",
      },
    ],
    defaultVariants: {
      family: "default",
      variant: "primary",
      size: "default",
    },
  },
);

export interface BrandButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "variant" | "size"
> {
  family?: BrandButtonFamily;
  variant?: BrandButtonVariant;
  size?: BrandButtonSize;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

function normalizeSize(
  size?: BrandButtonSize,
): "small" | "default" | "large" | "icon" | "icon-xs" | "icon-sm" | "icon-lg" | "xs" {
  if (size === "sm") return "small";
  if (size === "md") return "default";
  if (size === "lg") return "large";
  if (size === "xs") return "xs";
  if (size === "icon" || size === "icon-xs" || size === "icon-sm" || size === "icon-lg") {
    return size;
  }
  return size ?? "default";
}

function mapBrandVariantToBaseButtonVariant(
  variant: BrandButtonVariant,
): "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" {
  // Map to base Button variant with minimal conflicting styles
  // primary/default use "ghost" base since it has no bg/hover by default
  if (variant === "primary" || variant === "default") return "ghost";
  if (variant === "secondary") return "secondary";
  if (variant === "neutral" || variant === "flat") return "secondary";
  if (variant === "destructive") return "destructive";
  if (variant === "outline") return "outline";
  if (variant === "ghost" || variant === "nav") return "ghost";
  if (variant === "link" || variant === "linkWhite") return "link";
  return "ghost";
}

export const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  (
    {
      className,
      family = "default",
      variant = "primary",
      size,
      rightIcon,
      fullWidth,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const normalizedSize = normalizeSize(size);
    const baseVariant = mapBrandVariantToBaseButtonVariant(variant);
    const isLinkVariant = variant === "link" || variant === "linkWhite";

    const buttonContent = rightIcon ? (
      <span className="inline-flex items-center gap-2">
        {children}
        {rightIcon}
      </span>
    ) : (
      children
    );

    return (
      <Button
        ref={ref}
        variant={baseVariant}
        className={cn(
          brandVisualVariants({ family, variant, size: normalizedSize }),
          fullWidth && "w-full",
          // Remove base Button styles that conflict with link variants
          isLinkVariant && "!rounded-none",
          isLinkVariant && "!bg-transparent",
          isLinkVariant && "!shadow-none",
          isLinkVariant && "!border-0",
          isLinkVariant && "!inline-flex",
          isLinkVariant && "!h-auto",
          isLinkVariant && "hover:!no-underline",
          className,
        )}
        style={style}
        {...props}
      >
        {buttonContent}
      </Button>
    );
  },
);

BrandButton.displayName = "BrandButton";
