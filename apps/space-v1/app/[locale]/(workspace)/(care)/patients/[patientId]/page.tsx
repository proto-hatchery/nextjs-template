import { PatientDetailContainer } from "./_containers/patient-detail-container";

interface PatientDetailPageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { patientId } = await params;

  return <PatientDetailContainer patientId={patientId} />;
}
