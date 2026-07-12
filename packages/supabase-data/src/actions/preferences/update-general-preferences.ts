"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { authActionClient } from "@workspace/safe-action"
import { upsertGeneralPreferences } from "@workspace/supabase-data/modules/preferences/domain/services/upsert-preferences"

const generalPrefsSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  locale: z.string().trim().min(2).max(80),
  timezone: z.string().trim().min(2).max(80),
  workspaceName: z.string().trim().min(2).max(80),
})

export const updateGeneralPreferencesAction = authActionClient
  .inputSchema(generalPrefsSchema)
  .action(async ({ parsedInput, ctx }) => {
    await upsertGeneralPreferences(ctx.userId, parsedInput)
    revalidatePath("/[locale]/preferences", "layout")
    return { success: true }
  })

