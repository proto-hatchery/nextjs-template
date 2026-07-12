import { normalizeOptionalStringValue, toRHFEmptyString } from "@workspace/forms/v2/kernel";
import { createRequiredSelectIdCodec } from "@workspace/forms/v2/schema";
import { z } from "zod";

const requiredTitleCodec = z.codec(z.string(), z.string().min(2, "Título é obrigatório"), {
  decode: (value) => normalizeOptionalStringValue(value)?.trim() ?? "",
  encode: (value) => toRHFEmptyString(value),
});

export const createDocumentFormSchema = z.object({
  templateId: createRequiredSelectIdCodec("Selecione um modelo"),
  patientId: createRequiredSelectIdCodec("Selecione o paciente"),
  title: requiredTitleCodec,
});

export type CreateDocumentFormValues = z.input<typeof createDocumentFormSchema>;
export type CreateDocumentFormData = z.output<typeof createDocumentFormSchema>;
