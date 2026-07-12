import { normalizeOptionalStringValue } from "@workspace/forms/v2/kernel";
import { optionalSelectIdCodec } from "@workspace/forms/v2/schema";
import { z } from "zod";

export const optionalTextCodec = z.codec(z.string(), z.string().optional(), {
  decode: (value) => normalizeOptionalStringValue(value),
  encode: (value) => value ?? "",
});

export const createActivitySchema = z.object({
  activityId: z.string().min(1, "Selecione a atividade"),
  patientId: z.string().min(1, "Selecione o paciente"),
  sessionId: optionalSelectIdCodec,
  dueDate: optionalTextCodec,
  instructions: optionalTextCodec,
});

export type CreateActivityFormValues = z.input<typeof createActivitySchema>;
export type CreateActivityInput = z.output<typeof createActivitySchema>;
