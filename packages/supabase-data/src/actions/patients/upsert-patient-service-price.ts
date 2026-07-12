"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";

export type UpsertPatientServicePriceRequest = {
  patientId: string;
  serviceId: string;
  priceCents: number;
};

export type UpsertPatientServicePriceResponse = {
  success: true;
};

export type UpsertPatientServicePricePromise = Promise<
  SerializedResult<UpsertPatientServicePriceResponse>
>;

const upsertPatientServicePriceRequestSchema = z.object({
  patientId: z.uuid(),
  serviceId: z.uuid(),
  priceCents: z.number().int().nonnegative("Price cannot be negative"),
});

const _upsertPatientServicePriceAction = createAction<
  UpsertPatientServicePriceRequest,
  UpsertPatientServicePriceResponse
>({
  name: "upsertPatientServicePrice",
  inputSchema: upsertPatientServicePriceRequestSchema,
  handler: async (input, context) => {
    const { patientId, serviceId, priceCents } = input;
    const { userId, supabase } = context;

    const { error } = await supabase.from("psychologist_patient_services").upsert(
      {
        psychologist_id: userId,
        psychologist_patient_id: patientId,
        service_id: serviceId,
        price_cents: priceCents,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "psychologist_id, psychologist_patient_id, service_id",
      },
    );

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to upsert patient service price", {
          originalError: error.message,
        }),
      );
    }

    return ok({ success: true });
  },
});

export async function upsertPatientServicePriceAction(
  input: UpsertPatientServicePriceRequest,
): UpsertPatientServicePricePromise {
  const result = await _upsertPatientServicePriceAction(input);
  return serializeResult(result);
}
