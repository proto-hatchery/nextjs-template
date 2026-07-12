/**
 * Onboarding Step Schemas
 *
 * Zod schemas for onboarding step validation.
 * These are business rules that define valid onboarding data.
 */

import { z } from "zod";
import { CRP_FORMAT_ERROR_MESSAGE, CRP_FORMATTED_REGEX } from "@workspace/forms/utils/crp";

export const uuidSchema = z.string().uuid();

export const phoneSchema = z
  .string()
  .min(10, "Telefone deve ter pelo menos 10 dígitos")
  .max(15, "Telefone deve ter no máximo 15 dígitos")
  .regex(/^\+?[\d\s\-\(\)]+$/, "Formato de telefone inválido");

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD");

export const slugSchema = z
  .string()
  .min(3, "Slug deve ter pelo menos 3 caracteres")
  .max(50, "Slug deve ter no máximo 50 caracteres")
  .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens");

export const identityStepSchema = z.object({
  firstName: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().trim().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  birthDate: isoDateSchema,
  displayName: z.string().trim().min(2, "Nome de exibição é obrigatório"),
});

export type IdentityStepData = z.infer<typeof identityStepSchema>;

export const phoneVerificationStepSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, "Código deve ter 6 dígitos"),
});

export type PhoneVerificationStepData = z.infer<typeof phoneVerificationStepSchema>;

export const professionalStepSchema = z.object({
  crpNumber: z.string().trim().regex(CRP_FORMATTED_REGEX, CRP_FORMAT_ERROR_MESSAGE),
  crpState: z.string().length(2, "Estado do CRP é obrigatório"),
});

export type ProfessionalStepData = z.infer<typeof professionalStepSchema>;

export const serviceSchema = z.object({
  id: uuidSchema.optional(),
  serviceTypeId: uuidSchema,
  name: z.string().min(1, "Nome do serviço é obrigatório"),
  durationMinutes: z.number().int().min(15).max(300),
  priceInCents: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export const servicesStepSchema = z.object({
  services: z.array(serviceSchema).min(1, "Adicione pelo menos um serviço"),
});

export type ServicesStepData = z.infer<typeof servicesStepSchema>;

export const locationSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(1, "Nome do local é obrigatório"),
  address: z.string().optional(),
  isOnline: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const locationsStepSchema = z
  .object({
    locations: z.array(locationSchema),
    onlineOnly: z.boolean().default(false),
  })
  .refine((data) => data.onlineOnly || data.locations.length > 0, {
    message: "Adicione pelo menos um local ou selecione atendimento apenas online",
    path: ["locations"],
  });

export type LocationsStepData = z.infer<typeof locationsStepSchema>;

export const profileSlugSchema = z.object({
  slug: slugSchema,
});

export const profileLinksSchema = z.object({
  links: z
    .array(
      z.object({
        id: uuidSchema.optional(),
        title: z.string().min(1, "Título é obrigatório"),
        url: z.string().url("URL inválida"),
        active: z.boolean().default(true),
      }),
    )
    .max(5, "Máximo de 5 links"),
});

export const profileVisualSchema = z.object({
  displayName: z.string().trim().min(2, "Nome de exibição é obrigatório"),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
});

export const profileSpecialtiesSchema = z.object({
  specialties: z.array(z.string()),
  therapeuticApproaches: z.array(z.string()),
});

export const timelineItemSchema = z.object({
  id: uuidSchema,
  title: z.string().min(1, "Título é obrigatório"),
  subtitle: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  isCurrent: z.boolean(),
  type: z.enum(["academic", "professional"]),
});

export const profileEducationSchema = z.object({
  academicTimeline: z.array(timelineItemSchema),
});

export const profileExperienceSchema = z.object({
  professionalTimeline: z.array(timelineItemSchema),
});

export const profilePublishSchema = z.object({
  showInMarketplace: z.boolean().default(false),
  acceptingNewPatients: z.boolean().default(false),
});

export type ProfileSlugData = z.infer<typeof profileSlugSchema>;
export type ProfileLinksData = z.infer<typeof profileLinksSchema>;
export type ProfileVisualData = z.infer<typeof profileVisualSchema>;
export type ProfileSpecialtiesData = z.infer<typeof profileSpecialtiesSchema>;
export type ProfileEducationData = z.infer<typeof profileEducationSchema>;
export type ProfileExperienceData = z.infer<typeof profileExperienceSchema>;
export type ProfilePublishData = z.infer<typeof profilePublishSchema>;
