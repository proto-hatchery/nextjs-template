import { z } from "zod";

export const patientTestSchema = z.object({
  test_name: z.string().min(1, "Nome do teste é obrigatório"),
  applied_at: z.string().min(1, "Data de aplicação é obrigatória"),
  test_type: z.string().optional().default("psychological"),
});

export type PatientTestFormValues = z.infer<typeof patientTestSchema>;
