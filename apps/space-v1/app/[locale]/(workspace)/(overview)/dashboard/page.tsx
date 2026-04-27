import { DashboardOverviewShell } from "@/app/[locale]/(workspace)/(overview)/dashboard/_components/dashboard-overview-shell"
import { getDashboardOverviewView } from "@/app/[locale]/(workspace)/(overview)/dashboard/_lib/dashboard-view-model.server"

export default async function DashboardPage() {
  return <DashboardOverviewShell overview={await getDashboardOverviewView()} />
}
