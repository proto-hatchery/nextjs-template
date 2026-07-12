import { z } from "zod";

export const patientDocumentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  file: z.custom<File | undefined>((v) => v instanceof File || v === undefined),
});

export type PatientDocumentFormValues = z.infer<typeof patientDocumentSchema>;
