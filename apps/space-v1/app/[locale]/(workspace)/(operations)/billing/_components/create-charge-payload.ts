import type { CreateChargeRequest } from "@workspace/supabase-data/actions/billing/create-charge";

import {
  type ChargeFormValues,
  type ChargeSubmitValues,
  createChargeSchema,
} from "./create-charge-schema";

export function normalizeCreateChargeSubmitValues(
  values: ChargeFormValues | ChargeSubmitValues,
): ChargeSubmitValues {
  if (typeof values.amount === "number") {
    return {
      patientId: values.patientId,
      amount: values.amount,
      paymentStatus: values.paymentStatus ?? "pending",
      ...(values.serviceId !== undefined ? { serviceId: values.serviceId } : {}),
      ...(values.sessionId !== undefined ? { sessionId: values.sessionId } : {}),
      ...(values.dueDate !== undefined ? { dueDate: values.dueDate } : {}),
    };
  }

  return createChargeSchema.parse(values);
}

export function buildCreateChargePayload(values: ChargeSubmitValues): CreateChargeRequest {
  const payload: CreateChargeRequest = {
    patientId: values.patientId,
    priceCents: Math.round(values.amount * 100),
    paymentStatus: values.paymentStatus,
  };

  if (values.serviceId) {
    payload.serviceId = values.serviceId;
  }

  if (values.sessionId) {
    payload.sessionId = values.sessionId;
  }

  if (values.dueDate) {
    payload.dueDate = values.dueDate;
  }

  return payload;
}
