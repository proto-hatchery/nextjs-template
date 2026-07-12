"use client";

import { CRP_FORMAT_ERROR_MESSAGE, CRP_FORMATTED_REGEX } from "@workspace/forms/utils/crp";
import { z } from "zod";

// ============================================
// PHASE 1: COMPLIANCE & CHECKOUT (Pre-App Gatekeeper)
// 25% completion - Strict validation required before payment
// ============================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export const Phase1ComplianceSchema = z.object({
  // Identity
  firstName: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().trim().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  phone: z
    .string()
    .trim()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone inválido"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 100;
    }, "Idade deve ser entre 18 e 100 anos"),

  // Professional Compliance
  cpf: z
    .string()
    .trim()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX")
    .refine((cpf) => {
      // CPF validation algorithm
      const clean = cpf.replace(/\D/g, "");
      if (clean.length !== 11 || /^\d{11}$/.test(clean) === false) return false;

      // Check for known invalid CPFs
      if (/^(\d)\1{10}$/.test(clean)) return false;

      // Validate first digit
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(clean.charAt(i)) * (10 - i);
      }
      let rev = 11 - (sum % 11);
      if (rev === 10 || rev === 11) rev = 0;
      if (rev !== parseInt(clean.charAt(9))) return false;

      // Validate second digit
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(clean.charAt(i)) * (11 - i);
      }
      rev = 11 - (sum % 11);
      if (rev === 10 || rev === 11) rev = 0;

      return rev === parseInt(clean.charAt(10));
    }, "CPF inválido"),

  crp: z.string().trim().regex(CRP_FORMATTED_REGEX, CRP_FORMAT_ERROR_MESSAGE),

  crpState: z.string().length(2, "Selecione o estado do CRP"),

  // Document Upload (CRP verification document)
  crpDocument: z
    .custom<File>((file) => file instanceof File, "Documento é obrigatório")
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Documento deve ter no máximo 5MB")
    .refine(
      (file) => ACCEPTED_DOCUMENT_TYPES.includes(file?.type),
      "Apenas PDF, JPG ou PNG são aceitos",
    ),

  // Checkout
  subscriptionPlan: z.enum(["starter", "professional", "enterprise"], {
    error: "Selecione um plano",
  }),
});

export type Phase1ComplianceData = z.infer<typeof Phase1ComplianceSchema>;

// ============================================
// PHASE 2: CORE SETUP (Inside App - First Login)
// 50% completion - Minimum viable setup for scheduling
// ============================================

export const Phase2CoreSetupSchema = z.object({
  // First Service Configuration
  serviceType: z.enum(
    [
      "individual_therapy",
      "couples_therapy",
      "family_therapy",
      "group_therapy",
      "online_therapy",
      "evaluation",
    ],
    {
      error: "Selecione o tipo de atendimento",
    },
  ),

  sessionDuration: z
    .number()
    .min(30, "Mínimo 30 minutos")
    .max(180, "Máximo 180 minutos")
    .default(50),

  basePrice: z.number().min(1, "Preço deve ser maior que zero").max(10000, "Preço máximo excedido"),

  // Basic Availability
  workingDays: z
    .array(z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]))
    .min(1, "Selecione pelo menos 1 dia de trabalho"),

  workingHours: z
    .object({
      start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horário inválido"),
      end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horário inválido"),
    })
    .refine(
      (data) => data.start < data.end,
      "Horário de início deve ser anterior ao horário de término",
    ),
});

export type Phase2CoreSetupData = z.infer<typeof Phase2CoreSetupSchema>;

// ============================================
// PHASE 3: OPERATIONAL READINESS
// 75% completion - Secondary tools for automation
// ============================================

export const Phase3OperationalSchema = z.object({
  // Google Calendar Integration
  googleCalendarEnabled: z.boolean().default(false),
  googleCalendarId: z.string().optional(),

  // Cancellation Policies
  cancellationPolicy: z.object({
    hoursInAdvance: z.number().min(0, "Mínimo 0 horas").max(72, "Máximo 72 horas").default(24),
    penaltyPercentage: z.number().min(0, "Mínimo 0%").max(100, "Máximo 100%").default(50),
  }),

  // Notification Preferences
  notifications: z.object({
    email: z.boolean().default(true),
    whatsapp: z.boolean().default(false),
    reminderHours: z.number().min(1).max(72).default(24),
  }),
});

export type Phase3OperationalData = z.infer<typeof Phase3OperationalSchema>;

// ============================================
// PHASE 4: PUBLIC PROFILE (Contextual)
// 100% completion - Marketing and advanced features
// ============================================

const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const Phase4PublicProfileSchema = z.object({
  // Profile Photo
  photo: z
    .custom<File>()
    .optional()
    .refine((file) => !file || file.size <= MAX_PHOTO_SIZE, "Foto deve ter no máximo 2MB")
    .refine(
      (file) => !file || ACCEPTED_PHOTO_TYPES.includes(file.type),
      "Apenas JPG, PNG ou WebP são aceitos",
    ),

  // Professional Bio
  bio: z.string().trim().max(2000, "Bio deve ter no máximo 2000 caracteres").optional(),

  // Therapeutic Approach
  therapeuticApproaches: z.array(z.string()).max(5, "Máximo 5 abordagens").optional(),

  specialties: z.array(z.string()).max(10, "Máximo 10 especialidades").optional(),

  // Custom Domain
  customDomain: z
    .string()
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i, "Domínio inválido")
    .optional()
    .or(z.literal("")),

  // Linktree Settings
  linktreeEnabled: z.boolean().default(false),
  linktreeSlug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras, números e hífen")
    .optional(),
});

export type Phase4PublicProfileData = z.infer<typeof Phase4PublicProfileSchema>;

// ============================================
// DRAFT SCHEMAS (Partial validation for auto-save)
// ============================================

export const Phase1DraftSchema = Phase1ComplianceSchema.partial();
export const Phase2DraftSchema = Phase2CoreSetupSchema.partial();
export const Phase3DraftSchema = Phase3OperationalSchema.partial();
export const Phase4DraftSchema = Phase4PublicProfileSchema.partial();

// ============================================
// PROGRESS CALCULATION
// ============================================

export function calculateOnboardingProgress(
  phase1Complete: boolean,
  phase2Complete: boolean,
  phase3Complete: boolean,
  phase4Complete: boolean,
): number {
  let progress = 0;
  if (phase1Complete) progress += 25;
  if (phase2Complete) progress += 25;
  if (phase3Complete) progress += 25;
  if (phase4Complete) progress += 25;
  return progress;
}

export type OnboardingPhase = 1 | 2 | 3 | 4;

export function getCurrentPhase(
  phase1Complete: boolean,
  phase2Complete: boolean,
  phase3Complete: boolean,
  _phase4Complete: boolean,
): OnboardingPhase {
  if (!phase1Complete) return 1;
  if (!phase2Complete) return 2;
  if (!phase3Complete) return 3;
  return 4;
}
