"use client";

import { Checkbox } from "@workspace/ui/components/checkbox";
import { cn } from "@workspace/ui/lib/utils";

export interface ModernCheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function ModernCheckbox({
  checked,
  onCheckedChange,
  id,
  disabled,
  className,
}: ModernCheckboxProps) {
  return (
    <Checkbox
      {...(id !== undefined ? { id } : {})}
      {...(checked !== undefined ? { checked } : {})}
      {...(onCheckedChange !== undefined ? { onCheckedChange } : {})}
      {...(disabled !== undefined ? { disabled } : {})}
      className={cn("size-5 rounded-[0.40rem] border-none dark:bg-white/5", className)}
    />
  );
}
