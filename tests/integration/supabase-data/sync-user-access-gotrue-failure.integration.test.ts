/**
 * Covers the residual risk documented on {@link syncUserAccess}: Postgres may
 * reflect new access after `sync_user_roles` while
 * `auth.admin.updateUserById` fails, leaving JWT `app_metadata` stale.
 *
 * @see packages/supabase-data/src/actions/user-access/sync-user-access.ts
 */
import type { AuthError } from "@supabase/supabase-js"
import { describe, expect, it, vi } from "vitest"

import { expandRolesForAdmin } from "@workspace/supabase-auth/shared/auth-role"
import { ACCESS_CONTROL_TEMPLATE } from "@workspace/supabase-auth/testing/access-control-template"
import { syncUserAccess } from "@workspace/supabase-data/actions/user-access/sync-user-access"
import { createServiceRoleTestClient } from "@workspace/test-utils/supabase/clients"
import { createTestUser } from "@workspace/test-utils/supabase/users"

vi.mock("@workspace/supabase-infra/clients/admin", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@workspace/supabase-infra/clients/admin")>()
  return {
    createAdminClient: () => {
      const client = actual.createAdminClient()
      vi.spyOn(client.auth.admin, "updateUserById").mockResolvedValueOnce({
        data: { user: null },
        error: {
          message: "simulated GoTrue failure after DB sync",
          name: "AuthApiError",
          status: 500,
        } as AuthError,
      })
      return client
    },
  }
})

const { privilegedRole } = ACCESS_CONTROL_TEMPLATE

describe("syncUserAccess GoTrue failure after DB sync (template)", () => {
  it("throws when updateUserById fails after sync_user_roles succeeds; DB access rows remain updated", async () => {
    const admin = await createServiceRoleTestClient()
    const user = await createTestUser()

    await expect(syncUserAccess(user.userId, [privilegedRole])).rejects.toMatchObject({
      message: "simulated GoTrue failure after DB sync",
    })

    const { data: rolesAfter } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.userId)

    expect([...(rolesAfter?.map((row) => row.role) ?? [])].toSorted()).toEqual(
      [...expandRolesForAdmin([privilegedRole])].toSorted()
    )

    const authUser = await admin.auth.admin.getUserById(user.userId)
    expect(authUser.data.user?.app_metadata.roles).toBeUndefined()
    expect(authUser.data.user?.app_metadata.permissions).toBeUndefined()
    expect(authUser.data.user?.app_metadata.access_version).toBeUndefined()
    expect(authUser.data.user?.app_metadata.subscription).toBeUndefined()
  })
})
