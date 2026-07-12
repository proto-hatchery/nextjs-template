"use client";

import { usePatient as usePsychologistPatientDetails } from "@workspace/supabase-data/hooks/patients";
import type { PatientDocumentSummary } from "@/compat/supabase/utils/json-field-parsers";
import { Loader2 } from "lucide-react";

import { PatientInterventionsActivitiesSection } from "../interventions/patient-interventions-activities-section";
import { PatientInterventionsDocumentsSection } from "../interventions/patient-interventions-documents-section";
import { PatientInterventionsTestsSection } from "../interventions/patient-interventions-tests-section";
import { PatientDocumentsCard } from "../overview/patient-documents-card";

interface ClinicalDataTabProps {
  patientId: string;
}

export function ClinicalDataTab({ patientId }: ClinicalDataTabProps) {
  const { data: patient, isPending } = usePsychologistPatientDetails(patientId);

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const documents = (patient?.attached_documents as PatientDocumentSummary[] | undefined) ?? [];

  return (
    <div className="space-y-6">
      <PatientDocumentsCard documents={documents} patientId={patientId} />
      <div className="space-y-10">
        <PatientInterventionsDocumentsSection patientId={patientId} />
        <PatientInterventionsActivitiesSection patientId={patientId} />
        <PatientInterventionsTestsSection patientId={patientId} title="Instrumentos" />
      </div>
    </div>
  );
}
