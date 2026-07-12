/**
 * Charge Domain DTOs
 *
 * Pure domain models with no infrastructure dependencies.
 * These DTOs represent financial charges in the business domain.
 */

/**
 * Payment status enumeration
 */
export type PaymentStatus = "pending" | "paid" | "overdue" | "refunded" | "cancelled";

/**
 * Payment method enumeration - must match database enum
 */
export type PaymentMethod = "fluripay" | "card" | "cash" | "pix" | "bank_transfer" | "other";

/**
 * Charge DTO
 *
 * Represents a financial charge in the domain.
 * Readonly and immutable by design.
 */
export interface ChargeDTO {
  readonly id: string;
  readonly psychologistId: string;
  readonly patientId: string | null;
  readonly sessionId: string | null;
  readonly priceCents: number;
  readonly paymentStatus: PaymentStatus | null;
  readonly paymentMethod: PaymentMethod | null;
  readonly dueDate: string | null;
  readonly paidAt: string | null;
  readonly description: string | null;
  readonly paymentNotes: string | null;
  readonly invoiceNumber: string | null;
  readonly invoiceUrl: string | null;
  readonly attachmentUrl: string | null;
  readonly documentStatus: string | null;
  readonly lastSentAt: string | null;
  readonly sentCount: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string | null;
  readonly updatedBy: string | null;
}

/**
 * Charge with relations (for detailed views)
 */
export interface ChargeWithRelationsDTO {
  readonly charge: ChargeDTO;
  readonly patient: {
    readonly id: string;
    readonly fullName: string;
    readonly phone: string | null;
    readonly email: string | null;
  } | null;
  readonly session: {
    readonly id: string;
    readonly startTime: string;
    readonly serviceName: string | null;
  } | null;
}

/**
 * Charge summary DTO (lightweight for lists)
 */
export interface ChargeSummaryDTO {
  readonly id: string;
  readonly patientId: string | null;
  readonly priceCents: number;
  readonly paymentStatus: PaymentStatus | null;
  readonly dueDate: string | null;
  readonly paidAt: string | null;
  readonly createdAt: string;
}

/**
 * Charges collection DTO (paginated)
 */
export interface ChargesCollectionDTO {
  readonly charges: readonly ChargeSummaryDTO[];
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}

/**
 * Type guard for ChargeDTO
 */
export function isChargeDTO(value: unknown): value is ChargeDTO {
  if (!value || typeof value !== "object") return false;
  const charge = value as Record<string, unknown>;
  return (
    typeof charge.id === "string" &&
    typeof charge.psychologistId === "string" &&
    typeof charge.priceCents === "number"
  );
}
