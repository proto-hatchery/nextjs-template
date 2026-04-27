/**
 * Documents the **baseline access pipeline**: `sync_user_roles` RPC + GoTrue metadata +
 * `custom_access_token_hook` shape (`roles`, `permissions`, `subscription`, `access_version`).
 *
 * Replace role slugs with your product catalog (`ACCESS_CONTROL_TEMPLATE` in test-utils);
 * extend permissions via hook or JWT when you introduce fine-grained codes.
 */
import { describe, expect, it } from "vitest"

import { expandRolesForAdmin } from "@workspace/supabase-auth/shared/auth-role"
import { ACCESS_CONTROL_TEMPLATE } from "@workspace/supabase-auth/testing/access-control-template"
import { syncUserAccess } from "@workspace/supabase-data/actions/user-access/sync-user-access"
import { createServiceRoleTestClient } from "@workspace/test-utils/supabase/clients"
import { createTestUser, signInAsTestUser } from "@workspace/test-utils/supabase/users"

const { privilegedRole: R } = ACCESS_CONTROL_TEMPLATE

describe("access pipeline (integration template)", () => {
  it("syncUserAccess mirrors DB roles and empty permissions into GoTrue app_metadata", async () => {
    const admin = await createServiceRoleTestClient()
    const user = await createTestUser()

    const access = await syncUserAccess(user.userId, [R])
    const result = await admin.auth.admin.getUserById(user.userId)

    const expanded = expandRolesForAdmin([R])
    expect(access.roles).toEqual(expanded)
    expect(access.permissions).toEqual([])
    expect(result.data.user?.app_metadata.roles).toEqual(expanded)
    expect(result.data.user?.app_metadata.permissions).toEqual([])
    expect(result.data.user?.app_metadata.subscription).toEqual({})
  })

  it("get_my_access_payload reflects user_roles after sign-in (hook + DB)", async () => {
    const admin = await createServiceRoleTestClient()
    const { client, user } = await signInAsTestUser({
      appMetadata: {
        roles: [R],
      },
    })

    const insertRole = await admin.from("user_roles").insert({
      role: R,
      user_id: user.userId,
    })

    expect(insertRole.error).toBeNull()

    const payload = await client.rpc("get_my_access_payload")

    expect(payload.error).toBeNull()
    expect(payload.data).toEqual([
      {
        access_version: 1,
        permissions: [],
        roles: [R],
        subscription: {},
        user_id: user.userId,
      },
    ])
  })

  it("syncUserAccess with empty roles clears GoTrue role list (permissions stay empty in template)", async () => {
    const admin = await createServiceRoleTestClient()
    const user = await createTestUser()

    await syncUserAccess(user.userId, [R])
    await syncUserAccess(user.userId, [])

    const result = await admin.auth.admin.getUserById(user.userId)

    expect(result.data.user?.app_metadata.roles).toEqual([])
    expect(result.data.user?.app_metadata.permissions).toEqual([])
  })

  it("increments profiles.access_version when a profile row exists (session refresh signal)", async () => {
    const admin = await createServiceRoleTestClient()
    const user = await createTestUser()

    const ins = await admin.from("profiles").insert({
      user_id: user.userId,
    })
    expect(ins.error).toBeNull()

    await syncUserAccess(user.userId, [R])
    const afterFirst = await admin
      .from("profiles")
      .select("access_version")
      .eq("user_id", user.userId)
      .single()
    expect(afterFirst.data?.access_version).toBe(2)

    await syncUserAccess(user.userId, [R])
    const afterSecond = await admin
      .from("profiles")
      .select("access_version")
      .eq("user_id", user.userId)
      .single()
    expect(afterSecond.data?.access_version).toBe(3)
  })
})
