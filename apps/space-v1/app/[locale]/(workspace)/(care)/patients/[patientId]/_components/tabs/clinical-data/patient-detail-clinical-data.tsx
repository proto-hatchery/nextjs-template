"use client";

import { usePatientClinicalData } from "@workspace/supabase-data/hooks/patients";

import {
  PatientDetailCardErrorState,
  PatientDetailCardLoadingState,
} from "../../shared/patient-detail-card-states";
import { PatientClinicalConditionsCard } from "./patient-clinical-conditions-card";
import { PatientClinicalPreliminaryInfo } from "./patient-clinical-preliminary-info";

interface PatientDetailClinicalDataProps {
  patientId: string;
}

export function PatientDetailClinicalData({ patientId }: PatientDetailClinicalDataProps) {
  const { data, isPending, isError, refetch } = usePatientClinicalData(patientId);

  if (isPending) {
    return <PatientDetailCardLoadingState message="Carregando dados clínicos..." />;
  }

  if (isError) {
    return (
      <PatientDetailCardErrorState
        message="Não foi possível carregar os dados clínicos."
        onRetry={() => void refetch()}
      />
    );
  }

  // If we got here, data exists (even if empty) - render the sections
  // Child components should handle empty fields showing "-" or appropriate empty states
  if (!data) {
    return <PatientDetailCardErrorState message="Nenhuma informação clínica disponível." />;
  }

  return (
    <div className="space-y-10">
      <PatientClinicalPreliminaryInfo patientId={patientId} clinicalData={data} />

      <PatientClinicalConditionsCard patientId={patientId} clinicalData={data} />
    </div>
  );
}
