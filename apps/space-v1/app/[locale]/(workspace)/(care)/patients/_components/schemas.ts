import { z } from "zod";

export const phoneWithDDDSchema = z
  .string()
  .min(1, "Telefone é obrigatório")
  .superRefine((value, ctx) => {
    if (!value || value.trim().length === 0) {
      return; // Let required check handle empty
    }
    // Extract only digits
    let digits = value.replace(/\D/g, "");

    // If starts with DDI 55 (Brazil) and has plausible length (12-13), strip it to validate DDD+Number
    // Or if value explicitly starts with +55
    if (value.startsWith("+55") || (digits.startsWith("55") && digits.length >= 12)) {
      digits = digits.substring(2);
    }

    // Brazil-specific: Must have at least 10 digits (DDD: 2 + phone: 8+)
    if (digits.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Telefone incompleto. O DDD é obrigatório.",
      });
      return;
    }
    // Validate DDD + phone structure
    // DDD: first 2 digits (11–99), Phone: next 8–9 digits
    const dddMatch = /^(\d{2})(\d{8,9})$/.exec(digits);
    if (!dddMatch) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Formato inválido. Use: (DDD) 9XXXXXXXX ou (DDD) 8XXXXXXXX",
      });
    }
  });

export const quickPatientSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  phone: phoneWithDDDSchema,
});

export type QuickPatientInput = z.infer<typeof quickPatientSchema>;
