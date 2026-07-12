import { getPatientsAction } from "@workspace/supabase-data/actions/patients/get-patients";
import { getClaims } from "@workspace/supabase-auth/session/get-claims";
import { redirect } from "next/navigation";

export async function getPatientsPageData() {
  const claims = await getClaims();
  const userId = claims?.sub ?? null;

  if (!userId) {
    redirect("/login");
  }

  const result = await getPatientsAction({});
  if (!result.success) {
    throw new Error(result.error?.message ?? "Failed to load patients");
  }

  return {
    patients: result.data.patients,
  };
}
