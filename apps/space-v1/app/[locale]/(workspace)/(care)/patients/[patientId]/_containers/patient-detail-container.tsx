"use client";

import { usePatient as usePsychologistPatientDetails } from "@workspace/supabase-data/hooks/patients";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { SkeletonList } from "@workspace/brand/patterns/components/skeleton-compositions";
import { notFound, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { usePersistentTab } from "../../../../../hooks/use-persistent-tab";
import { PageContentHeader } from "../../../../_components/page-content-header";
import { SpaceEventCreationModal } from "../../../../_components/session-creation/space-event-creation-modal";
import { PatientDetailErrorState, PatientDetailView } from "../_components/patient-detail-view";
import { DeletePatientDialog } from "../_components/shared/delete-patient-dialog";
import { DEFAULT_PATIENT_TABS } from "../_components/shared/patient-detail-tabs";
import { getWhatsappHref } from "../_data/patient-contact";
import { calculateCaseIndexScore } from "../_data/patient-score";

interface PatientDetailContainerProps {
  patientId: string;
}

export function PatientDetailContainer({ patientId }: PatientDetailContainerProps) {
  const router = useRouter();
  const { data: patient, isPending, error } = usePsychologistPatientDetails(patientId);
  const { activeTab, setActiveTab } = usePersistentTab({
    paramName: "tab",
    defaultTab: "clinical-overview",
  }) as { activeTab: string; setActiveTab: (tab: string) => void };
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const tabs = useMemo(() => {
    return DEFAULT_PATIENT_TABS.filter((tab) => {
      if (tab.id === "guardians") {
        return patient?.is_minor ?? patient?.requires_legal_guardian;
      }
      return true;
    });
  }, [patient?.is_minor, patient?.requires_legal_guardian]);

  const caseIndexScore = useMemo(() => calculateCaseIndexScore(patient), [patient]);
  const whatsappHref = useMemo(() => getWhatsappHref(patient?.phone), [patient?.phone]);

  if (isPending) {
    return <PatientDetailSkeleton />;
  }

  if (error) {
    return <PatientDetailErrorState message="Erro ao carregar dados do paciente." />;
  }

  if (!patient) {
    notFound();
  }

  return (
    <>
      <PatientDetailView
        patient={patient}
        patientId={patientId}
        activeTab={activeTab}
        tabs={tabs}
        caseIndexScore={caseIndexScore}
        whatsappHref={whatsappHref}
        onTabChange={setActiveTab}
        onCreateSession={() => setIsCreateSessionOpen(true)}
        onDeletePatient={() => setIsDeleteDialogOpen(true)}
        onViewMissingFields={() => setActiveTab("clinical-overview")}
      />

      <SpaceEventCreationModal
        isOpen={isCreateSessionOpen}
        onClose={() => setIsCreateSessionOpen(false)}
        defaultPatientId={patientId}
        onSuccess={() => router.refresh()}
      />

      <DeletePatientDialog
        patient={patient}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}

function PatientDetailSkeleton() {
  return (
    <PageContentHeader
      breadcrumbs={
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Home</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Pacientes</span>
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-32" />
        </div>
      }
      actions={
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9" />
        </div>
      }
    >
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-background shrink-0 border-b">
            <div className="flex items-center gap-1 p-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-md" />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-6 max-w-[52rem]">
              <Skeleton className="h-48 w-full rounded-xl" />
              <SkeletonList count={4} />
            </div>
          </div>
        </div>

        <aside className="hidden lg:flex w-[380px] shrink-0 bg-muted/10 border-l border-border/50 flex-col">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PageContentHeader>
  );
}
