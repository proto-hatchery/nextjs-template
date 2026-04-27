import { BillingOverviewShell } from "@/app/[locale]/(workspace)/(operations)/billing/_components/billing-overview-shell"
import { getBillingOverviewView } from "@/app/[locale]/(workspace)/(operations)/billing/_lib/billing-view-model.server"

export default async function BillingPage() {
  return <BillingOverviewShell billingView={await getBillingOverviewView()} />
}
