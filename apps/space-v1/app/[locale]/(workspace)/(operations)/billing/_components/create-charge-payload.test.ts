import { describe, expect, it } from "vitest";

import {
  buildCreateChargePayload,
  normalizeCreateChargeSubmitValues,
} from "./create-charge-payload";

describe("buildCreateChargePayload", () => {
  it("normalizes RHF input values into submit values", () => {
    const values = normalizeCreateChargeSubmitValues({
      patientId: "3f49671f-5b50-467d-a74c-c7652dcb6c6b",
      amount: "R$ 450,00",
      dueDate: "15/03/2026",
      paymentStatus: "pending",
      serviceId: "",
      sessionId: "",
    });

    expect(values).toEqual({
      patientId: "3f49671f-5b50-467d-a74c-c7652dcb6c6b",
      amount: 450,
      dueDate: "2026-03-15",
      paymentStatus: "pending",
      serviceId: undefined,
      sessionId: undefined,
    });
  });

  it("omits optional session and service ids when they are undefined", () => {
    const payload = buildCreateChargePayload({
      patientId: "3f49671f-5b50-467d-a74c-c7652dcb6c6b",
      amount: 450,
      dueDate: "2026-03-15",
      paymentStatus: "pending",
      serviceId: undefined,
      sessionId: undefined,
    });

    expect(payload).toEqual({
      patientId: "3f49671f-5b50-467d-a74c-c7652dcb6c6b",
      priceCents: 45000,
      dueDate: "2026-03-15",
      paymentStatus: "pending",
    });
  });

  it("keeps optional ids when they are present", () => {
    const payload = buildCreateChargePayload({
      patientId: "3f49671f-5b50-467d-a74c-c7652dcb6c6b",
      amount: 150,
      dueDate: undefined,
      paymentStatus: "paid",
      serviceId: "dc0a6056-a86a-4540-8c7d-f12f18f40964",
      sessionId: "2fdb17d5-d3fc-4df9-8407-84443691852d",
    });

    expect(payload).toEqual({
      patientId: "3f49671f-5b50-467d-a74c-c7652dcb6c6b",
      priceCents: 15000,
      paymentStatus: "paid",
      serviceId: "dc0a6056-a86a-4540-8c7d-f12f18f40964",
      sessionId: "2fdb17d5-d3fc-4df9-8407-84443691852d",
    });
  });
});
