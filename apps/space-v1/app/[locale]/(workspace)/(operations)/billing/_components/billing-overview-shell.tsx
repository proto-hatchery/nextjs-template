import type { BillingOverviewView } from "@/app/[locale]/(workspace)/(operations)/billing/_lib/billing-types"
import { AppShellPage } from "@/app/[locale]/(workspace)/_components/app-shell-page"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type BillingOverviewShellProps = {
  billingView: BillingOverviewView
}

export function BillingOverviewShell({ billingView }: BillingOverviewShellProps) {
  return (
    <AppShellPage>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Operations</p>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          Billing is an operations surface with its own summaries, charge lists, and future dialogs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {billingView.summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">{card.context}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Charge queue</CardTitle>
            <CardDescription>
              Billing is now modeled as an operational queue instead of a single placeholder list.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {billingView.queue.length === 0 ? (
              <div className="space-y-2 rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm font-medium">No charges are visible yet</p>
                <p className="text-muted-foreground text-sm">
                  Billing will populate from shared financial records once charges and invoices are
                  available for this workspace.
                </p>
              </div>
            ) : (
              billingView.queue.map((charge) => (
                <div
                  key={charge.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{charge.title}</p>
                    <p className="text-muted-foreground text-sm">{charge.patientName}</p>
                    <p className="text-muted-foreground text-sm">
                      {charge.dueLabel} • {charge.paymentMethod}
                    </p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-sm font-semibold">{charge.amount}</p>
                    <Badge variant={charge.status === "Pending" ? "secondary" : "outline"}>
                      {charge.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action lanes</CardTitle>
            <CardDescription>
              Operational follow-up stays inside billing while still referencing patient and session
              context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {billingView.actionLanes.map((lane) => (
                <li key={lane}>
                  <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
                  {lane}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShellPage>
  )
}
