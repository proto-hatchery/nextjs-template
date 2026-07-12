/**
 * Server-side validation schemas using Zod.
 * These schemas ensure that all inputs are validated before processing,
 * preventing security issues from client-side validation bypass.
 */

import { z } from "zod";

/**
 * Validates a CPF number (Brazilian individual taxpayer registry)
 * Checks if all digits are the same, and validates check digits
 */
function isValidCpf(value: string | undefined): boolean {
  const digitsOnly = (value ?? "").replace(/\D/g, "");

  if (digitsOnly.length !== 11) return false;

  // Check if all digits are the same
  if (/(\d)\1{10}$/.test(digitsOnly)) return false;

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digitsOnly[i]!, 10) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const firstDigit = remainder < 2 ? 0 : remainder;

  if (parseInt(digitsOnly[9]!, 10) !== firstDigit) return false;

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digitsOnly[i]!, 10) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  const secondDigit = remainder < 2 ? 0 : remainder;

  return parseInt(digitsOnly[10]!, 10) === secondDigit;
}

/**
 * Schema for creating a patient.
 */
export const createPatientSchema = z.object({
  first_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255),
  last_name: z.string().max(255).optional().or(z.literal("")),
  preferred_name: z.string().max(255).optional().or(z.literal("")),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || val === "" || z.string().email().safeParse(val).success,
      "Email inválido",
    ),
  phone: z.string().max(50).optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  cpf: z
    .string()
    .max(20)
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => {
        if (!value || value.trim() === "") return true;
        return isValidCpf(value);
      },
      { message: "CPF inválido" },
    ),
  address: z
    .object({
      street: z.string().max(255),
      number: z.string().max(50),
      complement: z.string().max(255).optional().or(z.literal("")),
      neighborhood: z.string().max(255),
      city: z.string().max(255),
      state: z.string().max(2),
      postalCode: z.string().max(20),
      country: z.string().max(100).default("Brasil"),
    })
    .optional(),
  emergencyContacts: z
    .array(
      z.object({
        name: z.string().min(1).max(255),
        phone: z.string().max(50),
        relationship: z.string().max(100).optional().or(z.literal("")),
      }),
    )
    .optional(),
  defaultSessionPrice: z.number().int().positive().optional(),
  gender: z.string().optional().or(z.literal("")),
  preferred_contact_method: z.string().optional().or(z.literal("")),
  patient_origin: z.string().optional().or(z.literal("")),
});

/**
 * Schema for creating a session.
 */
export const createSessionSchema = z.object({
  patientId: z.uuid("ID do paciente inválido"),
  startTime: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { error: "Data e hora inválidas" },
  ),
  durationMinutes: z
    .number()
    .int()
    .min(15, "Duração mínima é 15 minutos")
    .max(240, "Duração máxima é 240 minutos")
    .optional(),
  serviceId: z.uuid("ID do serviço inválido").optional(),
  locationId: z.uuid("ID do local inválido").optional(),
  notes: z.string().max(5000).optional(),
  recurrenceRule: z.string().max(500).optional(),
  timezone: z.string().max(100).optional(),
  customPriceCents: z.number().int().positive().optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid"]).optional(),
});

/**
 * Schema for creating a charge.
 */
export const createChargeSchema = z.object({
  patientId: z.uuid("ID do paciente inválido"),
  priceCents: z.number().int().positive("O valor deve ser maior que zero"),
  description: z.string().max(1000).optional(),
  sessionId: z.uuid("ID da sessão inválido").optional(),
  serviceId: z.uuid("ID do serviço inválido").optional(),
  dueDate: z
    .string()
    .refine(
      (val) => {
        if (!val) return true; // Optional
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { error: "Data de vencimento inválida" },
    )
    .optional(),
  paymentStatus: z
    .enum(["pending", "paid", "overdue", "refunded", "cancelled"])
    .optional()
    .default("pending"),
});

/**
 * Schema for marking a charge as paid.
 */
export const markChargePaidSchema = z.object({
  paymentMethod: z.enum(["fluripay", "card", "cash", "pix", "bank_transfer", "other"]),
  paidAt: z
    .string()
    .refine(
      (val) => {
        if (!val) return true; // Optional
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { error: "Data de pagamento inválida" },
    )
    .optional(),
  paymentNotes: z.string().max(1000).optional(),
});

/**
 * Schema for updating charge status.
 */
export const updateChargeStatusSchema = z.object({
  status: z.enum(["pending", "paid", "cancelled", "overdue"]),
});

/**
 * Schema for updating charge payment method.
 */
export const updateChargeMethodSchema = z.object({
  paymentMethod: z.enum(["fluripay", "card", "cash", "pix", "bank_transfer", "other"]),
});

/**
 * Schema for updating charge value.
 */
export const updateChargeValueSchema = z.object({
  priceCents: z.number().int().positive("O valor deve ser maior que zero"),
});

// ============================================================================
// Availability
// ============================================================================

const hhmmRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Standard time schema HH:MM
 */
export const timeSchema = z.string().regex(hhmmRegex, "Horário inválido (HH:MM)");

/**
 * Single time interval schema
 */
export const intervalSchema = z.object({
  id: z.uuid().optional().nullable(),
  startTime: timeSchema,
  endTime: timeSchema,
  locationId: z.uuid().nullable().optional(),
  deliveryMode: z.enum(["in_person", "telehealth", "hybrid"]).default("hybrid"),
  dailyAppointmentLimit: z.number().int().positive().nullable().optional(),
});

/**
 * Interval schema with ID for queries
 */
export const queryIntervalSchema = intervalSchema.extend({
  id: z.string(),
});

/**
 * Day configuration schema
 */
export const dayConfigSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isActive: z.boolean(),
  intervals: z.array(intervalSchema),
});

/**
 * Weekly configuration schema
 */
export const weeklyConfigSchema = z.object({
  weeklyDays: z.array(dayConfigSchema),
});

/**
 * Legacy/Variant names for availability schemas
 */
export const dayAvailabilitySchema = dayConfigSchema;
export const saveWeeklyAvailabilitySchema = z.object({
  days: z.array(dayAvailabilitySchema),
});
export const saveDayIntervalsSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  intervals: z.array(intervalSchema).min(1, "Pelo menos um intervalo é necessário"),
  isActive: z.boolean(),
});

/**
 * Availability exception schema
 */
export const exceptionSchema = z.object({
  exceptionDate: z.string().regex(yyyymmddRegex, "Data inválida (YYYY-MM-DD)"),
  isAvailable: z.boolean(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  reason: z.string().max(500).optional(),
  createGoogleEvent: z.boolean().default(false),
});

/**
 * Schema for updating an availability exception
 */
export const updateExceptionSchema = z.object({
  exceptionId: z.uuid(),
  exceptionDate: z.string().regex(yyyymmddRegex, "Data inválida (YYYY-MM-DD)").optional(),
  isAvailable: z.boolean().optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  reason: z.string().max(500).optional(),
});

// Types inferred from schemas
export type SaveWeeklyAvailabilityConfigInput = z.infer<typeof weeklyConfigSchema>;
export type WeeklyDayConfig = z.infer<typeof dayConfigSchema>;
export type TimeInterval = z.infer<typeof intervalSchema>;
export type QueryTimeInterval = z.infer<typeof queryIntervalSchema>;
export type CreateExceptionInput = z.infer<typeof exceptionSchema>;
export type UpdateExceptionInput = z.infer<typeof updateExceptionSchema>;

/**
 * Legacy availability schema (keeping for compatibility)
 */
export const availabilitySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(hhmmRegex, "Horário inválido"),
    endTime: z.string().regex(hhmmRegex, "Horário inválido"),
    locationId: z.uuid("ID do local inválido").optional(),
    deliveryMode: z.enum(["in_person", "telehealth", "hybrid"]),
    isActive: z.boolean().optional(),
    effectiveStart: z.string().regex(yyyymmddRegex, "Data inválida").optional(),
    effectiveEnd: z.string().regex(yyyymmddRegex, "Data inválida").optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "O horário final deve ser após o horário inicial",
    path: ["endTime"],
  })
  .refine(
    (data) => {
      if (!data.effectiveStart || !data.effectiveEnd) return true;
      return data.effectiveEnd >= data.effectiveStart;
    },
    { message: "A data final deve ser após a data inicial", path: ["effectiveEnd"] },
  );

export const updateAvailabilitySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startTime: z.string().regex(hhmmRegex, "Horário inválido").optional(),
    endTime: z.string().regex(hhmmRegex, "Horário inválido").optional(),
    locationId: z.uuid("ID do local inválido").optional(),
    deliveryMode: z.enum(["in_person", "telehealth", "hybrid"]).optional(),
    isActive: z.boolean().optional(),
    effectiveStart: z.string().regex(yyyymmddRegex, "Data inválida").optional(),
    effectiveEnd: z.string().regex(yyyymmddRegex, "Data inválida").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime && data.endTime <= data.startTime) {
      ctx.addIssue({
        code: "custom",
        message: "O horário final deve ser após o horário inicial",
        path: ["endTime"],
      });
    }

    if (data.effectiveStart && data.effectiveEnd && data.effectiveEnd < data.effectiveStart) {
      ctx.addIssue({
        code: "custom",
        message: "A data final deve ser após a data inicial",
        path: ["effectiveEnd"],
      });
    }
  });

export const availabilityExceptionSchema = z
  .object({
    exceptionDate: z.string().regex(yyyymmddRegex, "Data inválida"),
    isAvailable: z.boolean(),
    reason: z.string().max(500).optional(),
    startTime: z.string().regex(hhmmRegex, "Horário inválido").optional(),
    endTime: z.string().regex(hhmmRegex, "Horário inválido").optional(),
  })
  .refine(
    (data) => {
      const hasStart = !!data.startTime;
      const hasEnd = !!data.endTime;
      return (hasStart && hasEnd) || (!hasStart && !hasEnd);
    },
    { message: "Informe horário inicial e final (ou nenhum)", path: ["startTime"] },
  )
  .refine((data) => !data.startTime || !data.endTime || data.endTime > data.startTime, {
    message: "O horário final deve ser após o horário inicial",
    path: ["endTime"],
  });

/**
 * Helper function to validate and parse input with a schema.
 * Returns the parsed data or throws a ZodError.
 */
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  return schema.parse(input);
}

/**
 * Helper function to safely validate input and return error message if invalid.
 * Returns { success: true, data } or { success: false, error }.
 */
export function safeValidateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format Zod errors into a user-friendly message
  const errorMessages = result.error.issues.map((err) => {
    const path = err.path.join(".");
    return path ? `${path}: ${err.message}` : err.message;
  });

  return {
    success: false,
    error: errorMessages.join("; "),
  };
}
