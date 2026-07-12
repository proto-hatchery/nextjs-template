import { v2Codecs } from "@workspace/forms/v2/schema";
import { z } from "zod";

export const quickPatientSchema = z.object({
  first_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  last_name: z.string().max(100, "Sobrenome deve ter no máximo 100 caracteres").optional(),
  phone: v2Codecs.phoneCodec.refine((value) => Boolean(value), "Telefone é obrigatório"),
});

export type QuickPatientFormValues = z.input<typeof quickPatientSchema>;
