import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
  role?: string;
  "aria-labelledby"?: string;
}

export function PageContainer({
  children,
  className,
  id,
  role,
  "aria-labelledby": ariaLabelledBy,
}: PageContainerProps) {
  const roleProps = role ? { role } : ariaLabelledBy ? { role: "region" } : {};
  const ariaProps = ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {};

  return (
    <div
      id={id}
      className={cn(
        "relative h-full min-h-0 w-full",
        "flex flex-col",
        "overflow-x-hidden overflow-y-hidden",
        className,
      )}
      {...roleProps}
      {...ariaProps}
    >
      {children}
    </div>
  );
}
