"use client";

import { useMemo } from "react";

import { PatientInterventionsNotesSection } from "./patient-interventions-notes-section";

export interface PatientInterventionsTabProps {
  patientId: string;
}

/**
 * PatientInterventionsTab
 *
 * Componente que exibe a aba de Intervenções na página de detalhes do paciente.
 * Organiza a seção de Notas Clínicas com o padrão de layout estabelecido.
 */
export function PatientInterventionsTab({ patientId }: PatientInterventionsTabProps) {
  // Memoize patientId to avoid unnecessary re-renders
  const memoizedPatientId = useMemo(() => patientId, [patientId]);

  return (
    <div className="space-y-10">
      {/* Section: Clinical Evolution */}
      <PatientInterventionsNotesSection patientId={memoizedPatientId} />
    </div>
  );
}
