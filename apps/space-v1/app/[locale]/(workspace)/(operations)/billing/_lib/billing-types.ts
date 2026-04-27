export type BillingStatus = "Pending" | "Sent" | "Paid"

export type BillingSummaryCard = {
  label: string
  value: string
  context: string
}

export type BillingEntry = {
  id: string
  title: string
  patientId: string
  patientName: string
  amount: string
  dueLabel: string
  status: BillingStatus
  paymentMethod: string
}

export type BillingOverviewView = {
  summaryCards: BillingSummaryCard[]
  queue: BillingEntry[]
  actionLanes: string[]
}
