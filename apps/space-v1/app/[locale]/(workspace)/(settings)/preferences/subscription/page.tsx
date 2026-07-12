import { redirect } from "next/navigation";

export default function SubscriptionPreferencesPage() {
  redirect("/preferences?tab=general");
}
