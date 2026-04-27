// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistPreferencesDTOSchema = z.object({
  createdAt: looseCell,
  id: looseCell,
  notificationsBillingAlerts: looseCell,
  notificationsEmailReminders: looseCell,
  notificationsMarketing: looseCell,
  notificationsPaymentReceipts: looseCell,
  notificationsSecurityAlerts: looseCell,
  notificationsWhatsappReminders: looseCell,
  preferences: looseCell,
  updatedAt: looseCell,
  userId: looseCell,
})

type PsychologistPreferencesDTO = z.infer<typeof PsychologistPreferencesDTOSchema>

export { PsychologistPreferencesDTOSchema, type PsychologistPreferencesDTO }
