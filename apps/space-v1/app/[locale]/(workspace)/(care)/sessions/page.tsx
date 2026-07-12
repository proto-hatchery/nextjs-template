import { getPsychologistClinicalSessionsAction } from "@workspace/supabase-data/actions/sessions/get-psychologist-clinical-sessions";
import { getClaims } from "@workspace/supabase-auth/session/get-claims";
import { redirect } from "next/navigation";

import { SessionsPageClient } from "./_components/sessions-page-client";

export default async function SessionsPage() {
  const claims = await getClaims();
  const userId = claims?.sub ?? null;
  if (!userId) {
    redirect("/login");
  }

  const result = await getPsychologistClinicalSessionsAction();
  const sessions = result.success ? result.data : [];

  return <SessionsPageClient sessions={sessions} />;
}
