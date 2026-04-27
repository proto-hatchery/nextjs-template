"use server"

import { revalidatePath } from "next/cache"

import { notificationsPrefsSchema } from "@/app/[locale]/(workspace)/(settings)/preferences/_lib/schemas"
import { authActionClient } from "@workspace/safe-action"
import { upsertNotificationsPreferences } from "@workspace/supabase-data/modules/preferences/domain/services/upsert-preferences.service"

export const updateNotificationsPreferencesAction = authActionClient
  .inputSchema(notificationsPrefsSchema)
  .action(async ({ parsedInput, ctx }) => {
    await upsertNotificationsPreferences(ctx.userId, parsedInput)
    revalidatePath("/[locale]/preferences", "layout")
    return { success: true }
  })
