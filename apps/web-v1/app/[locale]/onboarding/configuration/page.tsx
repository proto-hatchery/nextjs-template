import { validateStepAccessAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { redirect } from "next/navigation";

export default async function ConfigurationPage() {
  const accessResult = await validateStepAccessAction({ targetStepId: "subscription" });

  if (accessResult.success && !accessResult.data.allowed && accessResult.data.redirectTo) {
    redirect(accessResult.data.redirectTo);
  }

  redirect("/onboarding/subscription");
}
