import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type {
  ChargeDTO,
  ChargeWithRelationsDTO,
  ChargesCollectionDTO,
  PaymentStatus,
} from "../dto/charge.dto";

/**
 * Charge filters for queries
 */
export interface ChargeFilters {
  patientId?: string;
  paymentStatus?: PaymentStatus | PaymentStatus[];
  sessionId?: string;
}

/**
 * Charge Repository Port
 *
 * Domain interface for charge persistence.
 * Infrastructure implementations must conform to this contract.
 */
export interface ChargeRepository {
  /**
   * Find a charge by ID
   */
  findById(chargeId: string, psychologistId: string): Promise<Result<ChargeDTO | null, AppError>>;

  /**
   * Find a charge by ID with relations (patient, session)
   */
  findByIdWithRelations(
    chargeId: string,
    psychologistId: string,
  ): Promise<Result<ChargeWithRelationsDTO | null, AppError>>;

  /**
   * Find all charges with optional filters
   */
  findAll(
    psychologistId: string,
    filters?: ChargeFilters,
    options?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<Result<ChargesCollectionDTO, AppError>>;

  /**
   * Find charges with relations (includes patient and session details)
   */
  findAllWithRelations(
    psychologistId: string,
    filters?: ChargeFilters,
  ): Promise<Result<readonly ChargeWithRelationsDTO[], AppError>>;

  /**
   * Create a new charge
   */
  create(
    psychologistId: string,
    charge: Omit<ChargeDTO, "id" | "createdAt" | "updatedAt">,
  ): Promise<Result<ChargeDTO, AppError>>;

  /**
   * Update an existing charge
   */
  update(
    chargeId: string,
    psychologistId: string,
    updates: Partial<
      Omit<ChargeDTO, "id" | "psychologistId" | "createdAt" | "updatedAt" | "createdBy">
    >,
  ): Promise<Result<ChargeDTO, AppError>>;

  /**
   * Update charge payment status (convenience method)
   */
  updatePaymentStatus(
    chargeId: string,
    psychologistId: string,
    status: PaymentStatus,
    updatedBy: string,
  ): Promise<Result<void, AppError>>;

  /**
   * Delete a charge
   */
  delete(chargeId: string, psychologistId: string): Promise<Result<void, AppError>>;

  /**
   * Check if a charge exists
   */
  exists(chargeId: string, psychologistId: string): Promise<Result<boolean, AppError>>;
}
