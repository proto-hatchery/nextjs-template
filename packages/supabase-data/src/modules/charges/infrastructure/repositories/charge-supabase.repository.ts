import { err, ok, type Result } from "neverthrow";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { AppError } from "../../../../lib/errors/app-error";
import { AppErrorCode } from "../../../../lib/errors/app-error";
import type { ChargeRepository, ChargeFilters } from "../../domain/ports/charge-repository.port";
import type {
  ChargeDTO,
  ChargeWithRelationsDTO,
  ChargesCollectionDTO,
  PaymentStatus,
} from "../../domain/dto/charge.dto";
import {
  fromDatabaseRow,
  fromDatabaseRowToSummary,
  toDatabaseInsert,
  toDatabaseUpdate,
} from "../mappers/charge.mapper";
import { safeLogger } from "../../../../utils/safe-logger";

/**
 * Supabase implementation of Charge Repository
 *
 * This is the ONLY file in the charges module that imports Database types.
 */
export class ChargeSupabaseRepository implements ChargeRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Find a charge by ID
   */
  async findById(
    chargeId: string,
    psychologistId: string,
  ): Promise<Result<ChargeDTO | null, AppError>> {
    const SELECT_CHARGE_FIELDS =
      "id,psychologist_id,psychologist_patient_id,session_id,price_cents,payment_status,payment_method,due_date,paid_at,description,payment_notes,invoice_number,invoice_url,attachment_url,document_status,last_sent_at,sent_count,created_at,updated_at,created_by,updated_by" as const;

    const { data, error } = await this.supabase
      .from("psychologist_patient_charges")
      .select(SELECT_CHARGE_FIELDS)
      .eq("id", chargeId)
      .eq("psychologist_id", psychologistId)
      .maybeSingle();

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to fetch charge",
        context: { originalError: error.message },
      });
    }

    if (!data) {
      return ok(null);
    }

    return ok(fromDatabaseRow(data));
  }

  /**
   * Find a charge by ID with relations (patient, session)
   */
  async findByIdWithRelations(
    chargeId: string,
    psychologistId: string,
  ): Promise<Result<ChargeWithRelationsDTO | null, AppError>> {
    const { data, error } = await this.supabase
      .from("psychologist_patient_charges")
      .select(
        `
          *,
          patient:psychologist_patients!psychologist_patient_charges_psychologist_patient_id_fkey(
            id,
            full_name,
            display_name,
            phone,
            email
          ),
          session:calendar_events!psychologist_client_charges_session_id_fkey(
            id,
            start_datetime,
            service:psychologist_services!calendar_events_psychologist_service_id_fkey(
              name
            )
          )
        `,
      )
      .eq("id", chargeId)
      .eq("psychologist_id", psychologistId)
      .maybeSingle();

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to fetch charge with relations",
        context: { originalError: error.message },
      });
    }

    if (!data) {
      return ok(null);
    }

    const charge = fromDatabaseRow(data);

    // Build patient relation
    const patientData = data.patient as unknown as {
      id: string;
      full_name: string | null;
      display_name: string | null;
      phone: string | null;
      email: string | null;
    } | null;

    const patient = patientData
      ? {
          id: patientData.id,
          fullName: patientData.display_name || patientData.full_name || "",
          phone: patientData.phone ?? null,
          email: patientData.email ?? null,
        }
      : null;

    // Build session relation
    const sessionData = data.session as unknown as {
      id: string;
      start_datetime: string;
      service?: {
        name?: string | null;
      } | null;
    } | null;

    const session = sessionData
      ? {
          id: sessionData.id,
          startTime: sessionData.start_datetime,
          serviceName: sessionData.service?.name ?? null,
        }
      : null;

    return ok({
      charge,
      patient,
      session,
    });
  }

  /**
   * Find all charges with optional filters
   */
  async findAll(
    psychologistId: string,
    filters?: ChargeFilters,
    options?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<Result<ChargesCollectionDTO, AppError>> {
    const SELECT_SUMMARY_FIELDS =
      "id,psychologist_patient_id,price_cents,payment_status,due_date,paid_at,created_at" as const;

    let query = this.supabase
      .from("psychologist_patient_charges")
      .select(SELECT_SUMMARY_FIELDS, { count: "exact" })
      .eq("psychologist_id", psychologistId);

    if (filters?.patientId) {
      query = query.eq("psychologist_patient_id", filters.patientId);
    }

    if (filters?.sessionId) {
      query = query.eq("session_id", filters.sessionId);
    }

    if (filters?.paymentStatus) {
      if (Array.isArray(filters.paymentStatus) && filters.paymentStatus.length > 0) {
        query = query.in("payment_status", filters.paymentStatus);
      } else if (!Array.isArray(filters.paymentStatus)) {
        query = query.eq("payment_status", filters.paymentStatus);
      }
    }

    query = query.order("created_at", { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to fetch charges",
        context: { originalError: error.message },
      });
    }

    const charges = (data ?? []).map(fromDatabaseRowToSummary);
    const totalCount = count ?? 0;
    const hasMore =
      options?.limit !== undefined &&
      options?.offset !== undefined &&
      totalCount > options.offset + options.limit;

    return ok({
      charges,
      totalCount,
      hasMore,
    });
  }

  /**
   * Find charges with relations (includes patient and session details)
   */
  async findAllWithRelations(
    psychologistId: string,
    filters?: ChargeFilters,
  ): Promise<Result<readonly ChargeWithRelationsDTO[], AppError>> {
    let query = this.supabase
      .from("psychologist_patient_charges")
      .select(
        `
          *,
          patient:psychologist_patients!psychologist_patient_charges_psychologist_patient_id_fkey(
            id,
            full_name,
            display_name,
            phone,
            email
          ),
          session:calendar_events!psychologist_client_charges_session_id_fkey(
            id,
            start_datetime,
            service:psychologist_services!calendar_events_psychologist_service_id_fkey(
              name
            )
          )
        `,
      )
      .eq("psychologist_id", psychologistId);

    if (filters?.patientId) {
      query = query.eq("psychologist_patient_id", filters.patientId);
    }

    if (filters?.sessionId) {
      query = query.eq("session_id", filters.sessionId);
    }

    if (filters?.paymentStatus) {
      if (Array.isArray(filters.paymentStatus) && filters.paymentStatus.length > 0) {
        query = query.in("payment_status", filters.paymentStatus);
      } else if (!Array.isArray(filters.paymentStatus)) {
        query = query.eq("payment_status", filters.paymentStatus);
      }
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to fetch charges with relations",
        context: { originalError: error.message },
      });
    }

    const charges = (data ?? []).map((row) => {
      const charge = fromDatabaseRow(row);

      // Build patient relation
      const patientData = row.patient as unknown as {
        id: string;
        full_name: string | null;
        display_name: string | null;
        phone: string | null;
        email: string | null;
      } | null;

      const patient = patientData
        ? {
            id: patientData.id,
            fullName: patientData.display_name || patientData.full_name || "",
            phone: patientData.phone ?? null,
            email: patientData.email ?? null,
          }
        : null;

      // Build session relation
      const sessionData = row.session as unknown as {
        id: string;
        start_datetime: string;
        service?: {
          name?: string | null;
        } | null;
      } | null;

      const session = sessionData
        ? {
            id: sessionData.id,
            startTime: sessionData.start_datetime,
            serviceName: sessionData.service?.name ?? null,
          }
        : null;

      return {
        charge,
        patient,
        session,
      };
    });

    return ok(charges);
  }

  /**
   * Create a new charge
   */
  async create(
    psychologistId: string,
    charge: Omit<ChargeDTO, "id" | "createdAt" | "updatedAt">,
  ): Promise<Result<ChargeDTO, AppError>> {
    const insert = toDatabaseInsert(charge);

    const { data, error } = await this.supabase
      .from("psychologist_patient_charges")
      .insert(insert)
      .select(
        "id,psychologist_id,psychologist_patient_id,session_id,price_cents,payment_status,payment_method,due_date,paid_at,description,payment_notes,invoice_number,invoice_url,attachment_url,document_status,last_sent_at,sent_count,created_at,updated_at,created_by,updated_by",
      )
      .single();

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to create charge",
        context: { originalError: error.message },
      });
    }

    // Index the charge for AI search (non-blocking, don't fail creation)
    this.indexChargeForAI(data.id).catch((err) => {
      safeLogger.error("[ChargeSupabaseRepository] Failed to index charge for AI search", {
        chargeId: data.id,
        error: err instanceof Error ? err.message : String(err),
      });
    });

    return ok(fromDatabaseRow(data));
  }

  /**
   * Index charge for AI search via edge function
   */
  private async indexChargeForAI(chargeId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.functions.invoke("index-single-charge", {
        body: { chargeId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.errors?.[0] || "Unknown indexing error");
      }
    } catch (error) {
      // Log but don't throw - charge creation succeeded
      safeLogger.error("[ChargeSupabaseRepository] Charge AI indexing failed", {
        chargeId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Update an existing charge
   */
  async update(
    chargeId: string,
    psychologistId: string,
    updates: Partial<
      Omit<ChargeDTO, "id" | "psychologistId" | "createdAt" | "updatedAt" | "createdBy">
    >,
  ): Promise<Result<ChargeDTO, AppError>> {
    const dbUpdates = toDatabaseUpdate(updates);

    const { data, error } = await this.supabase
      .from("psychologist_patient_charges")
      .update(dbUpdates)
      .eq("id", chargeId)
      .eq("psychologist_id", psychologistId)
      .select(
        "id,psychologist_id,psychologist_patient_id,session_id,price_cents,payment_status,payment_method,due_date,paid_at,description,payment_notes,invoice_number,invoice_url,attachment_url,document_status,last_sent_at,sent_count,created_at,updated_at,created_by,updated_by",
      )
      .single();

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to update charge",
        context: { originalError: error.message },
      });
    }

    // Re-index the charge for AI search if description or payment fields changed (non-blocking)
    if (
      updates.description !== undefined ||
      updates.paymentStatus !== undefined ||
      updates.paymentMethod !== undefined ||
      updates.priceCents !== undefined
    ) {
      this.indexChargeForAI(chargeId).catch((err) => {
        safeLogger.error("[ChargeSupabaseRepository] Failed to re-index charge for AI search", {
          chargeId,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    }

    return ok(fromDatabaseRow(data));
  }

  /**
   * Update charge payment status (convenience method)
   */
  async updatePaymentStatus(
    chargeId: string,
    psychologistId: string,
    status: PaymentStatus,
    updatedBy: string,
  ): Promise<Result<void, AppError>> {
    const updateData: Record<string, unknown> = {
      payment_status: status,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    };

    // If marking as paid, set paid_at
    if (status === "paid") {
      updateData.paid_at = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from("psychologist_patient_charges")
      .update(updateData)
      .eq("id", chargeId)
      .eq("psychologist_id", psychologistId);

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to update payment status",
        context: { originalError: error.message },
      });
    }

    return ok(undefined);
  }

  /**
   * Delete a charge
   */
  async delete(chargeId: string, psychologistId: string): Promise<Result<void, AppError>> {
    const { error } = await this.supabase
      .from("psychologist_patient_charges")
      .delete()
      .eq("id", chargeId)
      .eq("psychologist_id", psychologistId);

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to delete charge",
        context: { originalError: error.message },
      });
    }

    return ok(undefined);
  }

  /**
   * Check if a charge exists
   */
  async exists(chargeId: string, psychologistId: string): Promise<Result<boolean, AppError>> {
    const { data, error } = await this.supabase
      .from("psychologist_patient_charges")
      .select("id")
      .eq("id", chargeId)
      .eq("psychologist_id", psychologistId)
      .maybeSingle();

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: "Failed to check charge existence",
        context: { originalError: error.message },
      });
    }

    return ok(data !== null);
  }
}
