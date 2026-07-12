import { describe, expect, it } from "vitest"

import { createServiceRoleTestClient } from "@workspace/test-utils/supabase/clients"
import { signInAsTestUser } from "@workspace/test-utils/supabase/users"

describe("psychologist_message_preferences RLS", () => {
  it("allows own rows and hides other psychologists' rows", async () => {
    const admin = await createServiceRoleTestClient()
    const actor = await signInAsTestUser()
    const target = await signInAsTestUser()
    const actorCategory = `actor-${crypto.randomUUID()}`
    const targetCategory = `target-${crypto.randomUUID()}`

    await admin.from("user_psychologists").insert([
      { id: actor.user.userId, full_name: "Actor Psychologist" },
      { id: target.user.userId, full_name: "Target Psychologist" },
    ])

    await admin.from("psychologist_message_preferences").insert({
      category: targetCategory,
      channel: "whatsapp",
      is_enabled: true,
      psychologist_id: target.user.userId,
      recipient_role: "patient",
    })

    const ownInsert = await actor.client.from("psychologist_message_preferences").insert({
      category: actorCategory,
      channel: "whatsapp",
      is_enabled: true,
      psychologist_id: actor.user.userId,
      recipient_role: "patient",
    })

    expect(ownInsert.error).toBeNull()

    const otherInsert = await actor.client.from("psychologist_message_preferences").insert({
      category: `blocked-${crypto.randomUUID()}`,
      channel: "email",
      is_enabled: true,
      psychologist_id: target.user.userId,
      recipient_role: "patient",
    })

    expect(otherInsert.error).not.toBeNull()

    const ownSelect = await actor.client
      .from("psychologist_message_preferences")
      .select("category, psychologist_id")
      .eq("category", actorCategory)

    expect(ownSelect.error).toBeNull()
    expect(ownSelect.data).toEqual([
      {
        category: actorCategory,
        psychologist_id: actor.user.userId,
      },
    ])

    const targetSelect = await actor.client
      .from("psychologist_message_preferences")
      .select("category, psychologist_id")
      .eq("category", targetCategory)

    expect(targetSelect.error).toBeNull()
    expect(targetSelect.data).toEqual([])
  })
})
