import { createServerClient } from "@supabase/ssr"
/**
 * Shows how **server `getAccess()`** merges JWT claims with `get_my_access_payload` when the
 * session is real. Template hook emits empty `permissions` from Postgres; roles come from `user_roles`.
 *
 * @see ACCESS_CONTROL_TEMPLATE — seed + naming contract for tests.
 */
import { afterEach, describe, expect, it, vi } from "vitest"

import { getAccess } from "@workspace/supabase-auth/session/get-access"
import { getSupabaseCookieOptions } from "@workspace/supabase-auth/shared/get-supabase-cookie-options"
import { ACCESS_CONTROL_TEMPLATE } from "@workspace/supabase-auth/testing/access-control-template"
import { getSupabasePublicEnv } from "@workspace/supabase-infra/env/public"
import type { Database } from "@workspace/supabase-infra/types/database"
import { createServiceRoleTestClient } from "@workspace/test-utils/supabase/clients"
import { createTestUser } from "@workspace/test-utils/supabase/users"

const { privilegedRole: R } = ACCESS_CONTROL_TEMPLATE

const { cookiesMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
}))

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}))

function createNextCookieStore() {
  const jar = new Map<string, string>()

  return {
    getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
    set: (name: string, value: string, ..._rest: unknown[]) => {
      void _rest
      jar.set(name, value)
    },
  }
}

async function signInServerSession(overrides?: {
  appMetadata?: Record<string, unknown>
  beforeSignIn?: (userId: string) => Promise<void>
}) {
  const cookieStore = createNextCookieStore()
  cookiesMock.mockResolvedValue(cookieStore)

  const {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabasePublishableKey,
  } = getSupabasePublicEnv()
  const bootstrap = createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookieOptions: getSupabaseCookieOptions(),
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Mirrors create-server-auth-client: RSC may not allow writes.
        }
      },
    },
  })

  const user = await createTestUser(overrides)
  await overrides?.beforeSignIn?.(user.userId)
  const { error } = await bootstrap.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  })

  expect(error).toBeNull()

  return { user }
}

/** Ensures `app_roles` + `user_roles` match seed so the JWT hook can emit `roles: [R]`. */
async function seedTemplatePrivilegedRole(userId: string) {
  const admin = await createServiceRoleTestClient()

  await admin.from("app_roles").upsert({
    is_self_sign_up_allowed: false,
    label: "Privileged (template)",
    role: R,
  })

  const inserted = await admin.from("user_roles").insert({
    role: R,
    user_id: userId,
  })

  expect(inserted.error).toBeNull()
}

afterEach(() => {
  cookiesMock.mockReset()
})

describe("getAccess (integration — JWT + RPC contract)", () => {
  it("resolves access from JWT after hook enriches session (template: one privileged role)", async () => {
    await signInServerSession({
      beforeSignIn: seedTemplatePrivilegedRole,
    })

    await expect(getAccess()).resolves.toEqual({
      accessVersion: 1,
      permissions: [],
      roles: [R],
      subscription: {},
    })
  })

  it("loads roles from DB when claims omit role list but `user_roles` is seeded", async () => {
    const { user } = await signInServerSession()
    await seedTemplatePrivilegedRole(user.userId)

    await expect(getAccess()).resolves.toEqual({
      accessVersion: 1,
      permissions: [],
      roles: [R],
      subscription: {},
    })
  })

  it("merges JWT + DB permission arrays (template DB is empty; add codes when you enrich hook)", async () => {
    const { user } = await signInServerSession({
      appMetadata: {
        permissions: [],
        roles: [R],
      },
    })
    await seedTemplatePrivilegedRole(user.userId)

    await expect(getAccess()).resolves.toEqual({
      accessVersion: 1,
      permissions: [],
      roles: [R],
      subscription: {},
    })
  })
})
