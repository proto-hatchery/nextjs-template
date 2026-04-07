import { createServerClient } from "@supabase/ssr"
/**
 * Verifies **JWKS-backed claims** after password sign-in, including `app_metadata` from the
 * custom access token hook (`roles`, `permissions`, `subscription`).
 *
 * @see ACCESS_CONTROL_TEMPLATE
 */
import { afterEach, describe, expect, it, vi } from "vitest"

import { getClaims } from "@workspace/supabase-auth/session/get-claims"
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

describe("getClaims (integration — hook-shaped app_metadata)", () => {
  it("exposes roles, empty permissions[], subscription, access_version on verified claims", async () => {
    const { user } = await signInServerSession({
      beforeSignIn: seedTemplatePrivilegedRole,
    })

    const claims = await getClaims()

    expect(claims).toMatchObject({
      app_metadata: {
        access_version: 1,
        permissions: [],
        roles: [R],
        subscription: {},
      },
      sub: user.userId,
    })
  })
})
