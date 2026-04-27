"use server"

import { revalidatePath } from "next/cache"

import { securityPrefsSchema } from "@/app/[locale]/(workspace)/(settings)/preferences/_lib/schemas"
import { authActionClient } from "@workspace/safe-action"
import { upsertSecurityPreferences } from "@workspace/supabase-data/modules/preferences/domain/services/upsert-preferences.service"

export const updateSecurityPreferencesAction = authActionClient
  .inputSchema(securityPrefsSchema)
  .action(async ({ parsedInput, ctx }) => {
    await upsertSecurityPreferences(ctx.userId, parsedInput)
    revalidatePath("/[locale]/preferences", "layout")
    return { success: true }
  })
