import "server-only"

import {
  listPsychologistPatientChargesAction,
} from "@workspace/supabase-data/actions/financial/psychologist-patient-charges-list.codegen"
import {
  listPsychologistInvoicesAction,
} from "@workspace/supabase-data/actions/financial/psychologist-invoices-list.codegen"
import {
  listPsychologistPatientsAction,
} from "@workspace/supabase-data/actions/patients/psychologist-patients-list.codegen"
import type { PsychologistPatientChargesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-patient-charges.dto.codegen"
import type { PsychologistInvoicesDTO } from "@workspace/supabase-data/modules/financial/domain/dto/psychologist-invoices.dto.codegen"
import type { PsychologistPatientsDTO } from "@workspace/supabase-data/modules/patients/domain/dto/psychologist-patients.dto.codegen"

import type {
  BillingEntry,
  BillingOverviewView,
  BillingStatus,
  BillingSummaryCard,
} from "@/app/[locale]/(workspace)/(operations)/billing/_lib/billing-types"

function asString(value: unknown) {
  return typeof value === "string" ? value : null
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : null
}

function getPatientDisplayName(patient: PsychologistPatientsDTO) {
  return (
    asString(patient.syncedDisplayName) ??
    asString(patient.manualDisplayName) ??
    asString(patient.syncedFullName) ??
    asString(patient.manualFullName) ??
    "Patient"
  )
}

function formatCurrencyFromCents(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value / 100)
}

function formatDateLabel(value: unknown) {
  const dateValue = asString(value)

  if (!dateValue) {
    return null
  }

  const parsed = new Date(dateValue)

  if (Number.isNaN(parsed.getTime())) {
    return dateValue
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

function getComparableTimestamp(value: unknown) {
  const dateValue = asString(value)

  if (!dateValue) {
    return 0
  }

  const parsed = new Date(dateValue)

  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

function resolveBillingStatus(charge: PsychologistPatientChargesDTO): BillingStatus {
  const paymentStatus = (asString(charge.paymentStatus) ?? "").toLowerCase()
  const lastSentAt = asString(charge.lastSentAt)

  if (paymentStatus.includes("paid") || paymentStatus.includes("settled")) {
    return "Paid"
  }

  if (paymentStatus.includes("sent") || paymentStatus.includes("processing") || lastSentAt) {
    return "Sent"
  }

  return "Pending"
}

function formatDueLabel(charge: PsychologistPatientChargesDTO, status: BillingStatus) {
  if (status === "Paid") {
    return `Settled on ${formatDateLabel(charge.paidAt) ?? "a prior date"}`
  }

  if (status === "Sent") {
    return `Sent ${formatDateLabel(charge.lastSentAt) ?? "recently"}`
  }

  return `Due ${formatDateLabel(charge.dueDate) ?? "date pending"}`
}

function formatPaymentMethod(charge: PsychologistPatientChargesDTO) {
  const rawMethod = (asString(charge.paymentMethod) ?? "").toLowerCase()

  switch (rawMethod) {
    case "pix":
      return "Pix"
    case "card":
    case "credit_card":
      return "Card"
    case "bank_transfer":
      return "Bank transfer"
    case "cash":
      return "Cash"
    default:
      return rawMethod ? rawMethod.replaceAll("_", " ") : "Unspecified"
  }
}

function mapChargeDtoToEntry(
  charge: PsychologistPatientChargesDTO,
  patientNameById: Map<string, string>
): BillingEntry {
  const patientId = asString(charge.psychologistPatientId) ?? ""
  const patientName = patientNameById.get(patientId) ?? "Linked patient"
  const status = resolveBillingStatus(charge)
  const amountCents = asNumber(charge.priceCents) ?? 0

  return {
    id: String(charge.id),
    title: asString(charge.description) ?? "Session charge",
    patientId,
    patientName,
    amount: formatCurrencyFromCents(amountCents),
    dueLabel: formatDueLabel(charge, status),
    status,
    paymentMethod: formatPaymentMethod(charge),
  }
}

async function getPatientNameByIdMap() {
  const patients = await listPsychologistPatientsAction({ limit: 100, offset: 0 })

  return new Map(
    patients.rows
      .map((patient) => [String(patient.id), getPatientDisplayName(patient)] as const)
      .filter(([id]) => id.length > 0)
  )
}

function buildSummaryCards(
  charges: PsychologistPatientChargesDTO[],
  invoices: PsychologistInvoicesDTO[]
): BillingSummaryCard[] {
  const pendingCharges = charges.filter((charge) => resolveBillingStatus(charge) === "Pending")
  const paidCharges = charges.filter((charge) => resolveBillingStatus(charge) === "Paid")
  const needsReviewCount = charges.filter((charge) => !asString(charge.documentStatus)).length
  const collectedAmount = paidCharges.reduce(
    (sum, charge) => sum + (asNumber(charge.priceCents) ?? 0),
    0
  )
  const outstandingAmount = pendingCharges.reduce(
    (sum, charge) => sum + (asNumber(charge.priceCents) ?? 0),
    0
  )
  const sentInvoices = invoices.filter((invoice) => {
    const status = (asString(invoice.status) ?? "").toLowerCase()
    return status.includes("open") || status.includes("sent")
  }).length

  return [
    {
      label: "Outstanding",
      value: formatCurrencyFromCents(outstandingAmount),
      context: "Charges still pending confirmation or payment.",
    },
    {
      label: "Collected this month",
      value: formatCurrencyFromCents(collectedAmount),
      context: "Paid charges currently visible through the shared financial surface.",
    },
    {
      label: "Needs review",
      value: `${needsReviewCount + sentInvoices} items`,
      context: "Records blocked by missing document status or invoices still awaiting follow-up.",
    },
  ]
}

function buildActionLanes(charges: PsychologistPatientChargesDTO[]) {
  const pendingWithoutDocument = charges.filter(
    (charge) => resolveBillingStatus(charge) === "Pending" && !asString(charge.documentStatus)
  ).length
  const sentButUnpaid = charges.filter((charge) => resolveBillingStatus(charge) === "Sent").length
  const missingMethod = charges.filter((charge) => !asString(charge.paymentMethod)).length

  return [
    pendingWithoutDocument > 0
      ? `${pendingWithoutDocument} pending charges still need document status confirmation.`
      : "Pending charges already carry a document status signal.",
    sentButUnpaid > 0
      ? `${sentButUnpaid} sent charges still need payment follow-up.`
      : "No sent charges are waiting on follow-up right now.",
    missingMethod > 0
      ? `${missingMethod} records still need payment method normalization.`
      : "Payment methods are already captured for the visible queue.",
  ]
}

export async function getBillingOverviewView(): Promise<BillingOverviewView> {
  const [chargesResult, invoicesResult, patientNameById] = await Promise.all([
    listPsychologistPatientChargesAction({ limit: 100, offset: 0 }),
    listPsychologistInvoicesAction({ limit: 100, offset: 0 }),
    getPatientNameByIdMap(),
  ])

  const queue = chargesResult.rows
    .map((charge) => ({
      entry: mapChargeDtoToEntry(charge, patientNameById),
      timestamp: getComparableTimestamp(charge.dueDate ?? charge.createdAt),
    }))
    .sort((left, right) => right.timestamp - left.timestamp)
    .map(({ entry }) => entry)

  return {
    summaryCards: buildSummaryCards(chargesResult.rows, invoicesResult.rows),
    queue,
    actionLanes: buildActionLanes(chargesResult.rows),
  }
}
