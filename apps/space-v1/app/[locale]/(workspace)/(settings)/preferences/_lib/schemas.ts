import { z } from "zod"

const generalPrefsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Enter a display name")
    .max(80, "Keep the name under 80 characters"),
  locale: z
    .string()
    .trim()
    .min(2, "Enter a locale")
    .max(80, "Keep the locale under 80 characters"),
  timezone: z
    .string()
    .trim()
    .min(2, "Enter a timezone")
    .max(80, "Keep the timezone under 80 characters"),
  workspaceName: z
    .string()
    .trim()
    .min(2, "Enter a workspace name")
    .max(80, "Keep the name under 80 characters"),
})

const notificationsPrefsSchema = z.object({
  notificationsWhatsappReminders: z.boolean(),
  notificationsEmailReminders: z.boolean(),
  notificationsPaymentReceipts: z.boolean(),
  notificationsBillingAlerts: z.boolean(),
  notificationsMarketing: z.boolean(),
})

const securityPrefsSchema = z.object({
  twoFactorEnabled: z.boolean(),
  recoveryEmailConfirmed: z.boolean(),
  notificationsSecurityAlerts: z.boolean(),
})

type GeneralPrefsSchema = z.output<typeof generalPrefsSchema>
type NotificationsPrefsSchema = z.output<typeof notificationsPrefsSchema>
type SecurityPrefsSchema = z.output<typeof securityPrefsSchema>

export {
  generalPrefsSchema,
  notificationsPrefsSchema,
  securityPrefsSchema,
  type GeneralPrefsSchema,
  type NotificationsPrefsSchema,
  type SecurityPrefsSchema,
}
