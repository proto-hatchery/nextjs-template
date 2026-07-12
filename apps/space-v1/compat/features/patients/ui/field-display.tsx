"use client";

import { RiAlertFill } from "@remixicon/react";
import { PencilLine } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Sensitive } from "@workspace/brand/patterns/privacy/sensitive";

export type PatientField = {
  label: string;
  value?: React.ReactNode;
  isAlert?: boolean;
  helperText?: string;
  isSensitive?: boolean;
  maskVariant?: "blur" | "redact";
};

export type FieldDisplayProps = {
  label?: string;
  value?: React.ReactNode;
  variant?: "default" | "alert";
  helperText?: string;
  field?: PatientField;
  className?: string;
  isEditable?: boolean;
  onEdit?: () => void;
  editAriaLabel?: string;
  isSensitive?: boolean;
  maskVariant?: "blur" | "redact";
};

export function FieldDisplay({
  label: labelProp,
  value: valueProp,
  variant = "default",
  helperText: helperTextProp,
  field,
  className,
  isEditable = false,
  onEdit,
  editAriaLabel = "Editar campo",
  isSensitive = false,
  maskVariant = "blur",
}: FieldDisplayProps) {
  const label = field?.label ?? labelProp ?? "";
  const value = field?.value ?? valueProp;
  const isAlert = field?.isAlert ?? variant === "alert";
  const helperText = field?.helperText ?? helperTextProp;
  const fieldIsSensitive = field?.isSensitive ?? isSensitive;
  const fieldMaskVariant = field?.maskVariant ?? maskVariant;

  const hasValue = value !== null && value !== undefined && value !== "";
  const displayValue = hasValue ? (
    fieldIsSensitive ? (
      <Sensitive variant={fieldMaskVariant}>{value}</Sensitive>
    ) : (
      value
    )
  ) : (
    "—"
  );

  const showEditButton = isEditable && typeof onEdit === "function";

  return (
    <div className={cn("space-y-1", showEditButton ? "group" : undefined, className)}>
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>

        {isAlert && helperText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <RiAlertFill
                  className="size-3.5 cursor-pointer text-amber-500"
                  aria-label="Alerta"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{helperText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {isAlert && !helperText && (
          <RiAlertFill className="size-3.5 text-amber-500" aria-label="Alerta" />
        )}
        {showEditButton ? (
          <button
            type="button"
            onClick={onEdit}
            aria-label={editAriaLabel}
            className={cn(
              "ml-auto inline-flex items-center justify-center rounded-full p-1 text-muted-foreground/70 transition",
              "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "opacity-0 group-hover:opacity-100",
            )}
          >
            <PencilLine className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div className={cn("text-sm", hasValue ? "text-foreground" : "text-muted-foreground")}>
        {displayValue}
      </div>
    </div>
  );
}
