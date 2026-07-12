import { z } from "zod";

export const clinicalEntrySchema = z
  .object({
    kind: z.enum(["condition", "medication"]),
    name: z.string().min(1, "Nome é obrigatório"),
    conditionCategory: z
      .enum(["mental_disorder", "chronic_disease", "physical_disability", "other"])
      .optional(),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.kind === "condition" && !data.conditionCategory) return false;
      return true;
    },
    { message: "Categoria da condição é obrigatória", path: ["conditionCategory"] },
  );

export type ClinicalEntryFormValues = z.infer<typeof clinicalEntrySchema>;
