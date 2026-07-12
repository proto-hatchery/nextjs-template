"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { authActionClient } from "@workspace/safe-action"
import { upsertNotificationsPreferences } from "@workspace/supabase-data/modules/preferences/domain/services/upsert-preferences"

const notificationsPrefsSchema = z.object({
  notificationsWhatsappReminders: z.boolean(),
  notificationsEmailReminders: z.boolean(),
  notificationsPaymentReceipts: z.boolean(),
  notificationsBillingAlerts: z.boolean(),
  notificationsMarketing: z.boolean(),
})

export const updateNotificationsPreferencesAction = authActionClient
  .inputSchema(notificationsPrefsSchema)
  .action(async ({ parsedInput, ctx }) => {
    await upsertNotificationsPreferences(ctx.userId, parsedInput)
    revalidatePath("/[locale]/preferences", "layout")
    return { success: true }
  })

