import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@workspace/ui/lib/utils";
export type LinktreeTheme = {
  colors: {
    background: string;
    foreground: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    primary: string;
    primaryText: string;
    secondary: string;
    secondaryText: string;
    accent: string;
  };
  rounded: "none" | "xs" | "sm" | "md" | "xl" | "full";
};

const getRoundedClasses = (rounded: LinktreeTheme["rounded"]) => {
  const button =
    rounded === "none"
      ? "rounded-none"
      : rounded === "xs"
        ? "rounded-sm"
        : rounded === "sm"
          ? "rounded-md"
          : rounded === "md"
            ? "rounded-lg"
            : rounded === "xl"
              ? "rounded-xl"
              : "rounded-full";
  return { button };
};

const linktreeButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 border-2",
  {
    variants: {
      size: {
        default: "h-12 px-6 text-base has-[>svg]:px-4",
        sm: "h-10 px-4 text-sm has-[>svg]:px-3",
        lg: "h-14 px-8 text-lg has-[>svg]:px-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export type LinktreeButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof linktreeButtonVariants> & {
    asChild?: boolean;
    theme: LinktreeTheme;
    variant?: "primary" | "secondary";
    index?: number;
  };

export const LinktreeButton = React.forwardRef<HTMLButtonElement, LinktreeButtonProps>(
  ({ className, size, asChild = false, theme, variant, index, style, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";

    // Auto-select primary for index 0 if not explicitly provided
    const isPrimary = variant === "primary" || (variant === undefined && index === 0);

    const buttonRadius = getRoundedClasses(theme.rounded).button;

    const dynamicStyles = {
      background: isPrimary ? theme.colors.primary : theme.colors.surface,
      color: isPrimary ? theme.colors.primaryText : theme.colors.foreground,
      borderColor: isPrimary ? theme.colors.primary : theme.colors.border,
      ...style,
    };

    return (
      <Comp
        data-slot="linktree-button"
        className={cn(linktreeButtonVariants({ size }), buttonRadius, className)}
        style={dynamicStyles}
        ref={ref}
        {...props}
      />
    );
  },
);

LinktreeButton.displayName = "LinktreeButton";
