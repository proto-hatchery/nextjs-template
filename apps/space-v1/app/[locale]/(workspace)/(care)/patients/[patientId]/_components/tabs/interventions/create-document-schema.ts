import { v2Codecs } from "@workspace/forms/v2/schema";
import { z } from "zod";

export const createDocumentSchema = z.object({
  templateId: v2Codecs.optionalSelectIdCodec.refine(
    (value) => Boolean(value),
    "Selecione um modelo",
  ),
  patientId: v2Codecs.optionalSelectIdCodec.refine(
    (value) => Boolean(value),
    "Selecione um paciente",
  ),
  title: z.string().min(2, "Título é obrigatório"),
});

export type CreateDocumentFormValues = z.input<typeof createDocumentSchema>;
export type CreateDocumentInput = z.output<typeof createDocumentSchema>;
