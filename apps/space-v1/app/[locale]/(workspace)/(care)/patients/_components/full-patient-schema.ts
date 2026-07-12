import { isValidCpf } from "@workspace/forms/utils/validation";
import { v2Codecs } from "@workspace/forms/v2/schema";
import { z } from "zod";

export const fullPatientSchema = z.object({
  manual_first_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  manual_last_name: z.string().optional(),
  manual_preferred_name: z.string().optional(),
  manual_phone: v2Codecs.phoneCodec.refine((value) => Boolean(value), "Telefone é obrigatório"),
  manual_date_of_birth: z.string().optional().nullable(),
  manual_cpf: z
    .string()
    .optional()
    .refine(
      (value) => {
        // Allow empty string (optional field) or valid CPF
        if (!value || value.trim() === "") return true;
        return isValidCpf(value);
      },
      { message: "CPF inválido" },
    ),
  manual_address: z
    .object({
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().min(1, "País é obrigatório").default("Brasil"),
    })
    .optional()
    .nullable(),
  guardian_name: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  manual_preferred_contact_method: z.string().optional(),
  notifications_whatsapp_session_reminders: z.boolean().optional(),
  manual_patient_origin: z.string().optional(),
  manual_is_minor: z.boolean().optional(),
  manual_email: z.string().optional(),
});

export type FullPatientFormValues = z.infer<typeof fullPatientSchema>;

export const STEPS_CONFIG = [
  {
    id: 0,
    label: "Identificação",
    description: "Dados básicos e CPF",
    fields: [
      "manual_first_name",
      "manual_last_name",
      "manual_phone",
      "manual_date_of_birth",
      "manual_cpf",
    ],
  },
  {
    id: 1,
    label: "Endereço",
    description: "Endereço residencial",
    fields: ["manual_address"],
  },
  {
    id: 2,
    label: "Emergência",
    description: "Contatos de emergência",
    fields: ["emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship"],
  },
] as const;
