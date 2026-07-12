"use client";

import type { ReactNode } from "react";

import {
  PatientDetailCardItem,
  PatientDetailCardItemActions,
} from "../../shared/patient-detail-card-item";

interface PatientClinicalConditionItemProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  status?: string;
  meta?: string;
  source?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}

export function PatientClinicalConditionItem({
  icon,
  title,
  subtitle,
  status,
  meta,
  source,
  onEdit,
  onDelete,
  deleting,
}: PatientClinicalConditionItemProps) {
  return (
    <PatientDetailCardItem
      icon={icon}
      actions={
        <PatientDetailCardItemActions
          {...(onEdit !== undefined ? { onEdit } : {})}
          {...(onDelete !== undefined ? { onDelete } : {})}
          {...(deleting !== undefined ? { editDisabled: deleting, deleteDisabled: deleting } : {})}
        />
      }
    >
      <div className="flex items-center gap-2 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{title}</p>
        {source ? (
          <span className="shrink-0 rounded-full bg-background/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {source}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        {subtitle ? <p className="text-xs text-muted-foreground truncate">{subtitle}</p> : null}
        {status ? (
          <>
            <span className="text-[10px] text-muted-foreground/30">•</span>
            <span className="text-xs font-medium text-primary/80">{status}</span>
          </>
        ) : null}
      </div>
      {meta ? (
        <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1 italic">{meta}</p>
      ) : null}
    </PatientDetailCardItem>
  );
}
