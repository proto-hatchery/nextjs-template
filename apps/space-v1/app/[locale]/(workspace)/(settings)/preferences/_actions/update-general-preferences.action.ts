"use server"

import { revalidatePath } from "next/cache"

import { authActionClient } from "@workspace/safe-action"
import {
  insertPsychologistPreferencesAction as insertPsychologistPreferences,
} from "@workspace/supabase-data/actions/preferences/psychologist-preferences-insert.codegen"
import {
  updatePsychologistPreferencesAction as updatePsychologistPreferences,
} from "@workspace/supabase-data/actions/preferences/psychologist-preferences-update.codegen"

import { getPreferencesRecord } from "../_lib/preferences-view-model.server"
import { mergeGeneralPrefs } from "../_lib/preferences-merge.helpers"
import { generalPrefsSchema } from "../_lib/schemas"

export const updateGeneralPreferencesAction = authActionClient
  .inputSchema(generalPrefsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const existing = await getPreferencesRecord(ctx.userId)
    const payload = mergeGeneralPrefs(existing, parsedInput)

    if (existing) {
      await updatePsychologistPreferences({
        id: existing.id as string,
        data: payload,
      })
    } else {
      await insertPsychologistPreferences({
        userId: ctx.userId,
        ...payload,
      })
    }

    revalidatePath("/[locale]/(workspace)/(settings)/preferences", "layout")

    return { success: true }
  })
