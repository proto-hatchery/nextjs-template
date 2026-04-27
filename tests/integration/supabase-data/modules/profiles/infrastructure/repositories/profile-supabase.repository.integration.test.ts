import { describe, expect, it } from "vitest"

import { ProfileSupabaseRepository } from "@workspace/supabase-data/modules/profiles/infrastructure/repositories/profile-supabase.repository"
import { createServiceRoleTestClient } from "@workspace/test-utils/supabase/clients"
import { createTestUser, signInAsTestUser } from "@workspace/test-utils/supabase/users"

describe("ProfileSupabaseRepository", () => {
  it("returns null when no profile exists", async () => {
    const { client } = await signInAsTestUser({
      appMetadata: {
        roles: ["partner"],
      },
    })
    const target = await createTestUser()
    const repository = new ProfileSupabaseRepository(client)

    await expect(repository.findByUserId(target.userId)).resolves.toBeNull()
  })

  it("loads a profile for the authenticated user", async () => {
    const admin = await createServiceRoleTestClient()
    const { client, user } = await signInAsTestUser({
      appMetadata: {
        roles: ["partner"],
      },
    })
    const repository = new ProfileSupabaseRepository(client)

    const inserted = await admin.from("profiles").insert({
      full_name: "Profile User",
      user_id: user.userId,
    })

    expect(inserted.error).toBeNull()

    await expect(repository.findByUserId(user.userId)).resolves.toMatchObject({
      fullName: "Profile User",
      userId: user.userId,
    })
  })
})
