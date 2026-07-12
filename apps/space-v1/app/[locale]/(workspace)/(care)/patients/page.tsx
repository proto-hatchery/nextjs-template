import { PatientsPageView } from "./_components/patients-page-view";
import { getPatientsPageData } from "./_lib/get-patients-page-data";

export default async function PatientsPage() {
  const data = await getPatientsPageData();

  return <PatientsPageView {...data} />;
}
