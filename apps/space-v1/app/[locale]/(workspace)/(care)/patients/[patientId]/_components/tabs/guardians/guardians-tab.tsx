"use client";

import { useMemo } from "react";

import { PatientGuardiansDocumentsSection } from "./patient-guardians-documents-section";
import { PatientGuardiansInfoSection } from "./patient-guardians-info-section";

export function PatientGuardiansTab({ patientId }: { patientId: string }) {
  const memoizedPatientId = useMemo(() => patientId, [patientId]);

  return (
    <div className="space-y-10">
      <PatientGuardiansInfoSection patientId={memoizedPatientId} />
      <PatientGuardiansDocumentsSection patientId={memoizedPatientId} />
    </div>
  );
}
