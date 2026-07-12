"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { authActionClient } from "@workspace/safe-action"
import { upsertSecurityPreferences } from "@workspace/supabase-data/modules/preferences/domain/services/upsert-preferences"

const securityPrefsSchema = z.object({
  twoFactorEnabled: z.boolean(),
  recoveryEmailConfirmed: z.boolean(),
  notificationsSecurityAlerts: z.boolean(),
})

export const updateSecurityPreferencesAction = authActionClient
  .inputSchema(securityPrefsSchema)
  .action(async ({ parsedInput, ctx }) => {
    await upsertSecurityPreferences(ctx.userId, parsedInput)
    revalidatePath("/[locale]/preferences", "layout")
    return { success: true }
  })

