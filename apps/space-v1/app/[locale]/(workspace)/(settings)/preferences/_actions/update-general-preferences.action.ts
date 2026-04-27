"use server"

import { revalidatePath } from "next/cache"

import { generalPrefsSchema } from "@/app/[locale]/(workspace)/(settings)/preferences/_lib/schemas"
import { authActionClient } from "@workspace/safe-action"
import { upsertGeneralPreferences } from "@workspace/supabase-data/modules/preferences/domain/services/upsert-preferences.service"

export const updateGeneralPreferencesAction = authActionClient
  .inputSchema(generalPrefsSchema)
  .action(async ({ parsedInput, ctx }) => {
    await upsertGeneralPreferences(ctx.userId, parsedInput)
    revalidatePath("/[locale]/preferences", "layout")
    return { success: true }
  })
