"use client";

import { useMemo } from "react";

import { PatientSessionsFinancialSection } from "./patient-sessions-financial-section";
import { PatientSessionsListSection } from "./patient-sessions-list-section";
import { PatientSessionsStatsSection } from "./patient-sessions-stats-section";

export interface SessionsTabProps {
  patientId: string;
}

export function SessionsTab({ patientId }: SessionsTabProps) {
  // Memoize patientId to avoid unnecessary re-renders
  const memoizedPatientId = useMemo(() => patientId, [patientId]);

  return (
    <div className="space-y-10">
      {/* Section 1: Session Statistics */}
      <PatientSessionsStatsSection patientId={memoizedPatientId} />

      {/* Section 2: Sessions List */}
      <PatientSessionsListSection patientId={memoizedPatientId} />

      {/* Section 3: Financial Control */}
      <PatientSessionsFinancialSection patientId={memoizedPatientId} />
    </div>
  );
}
