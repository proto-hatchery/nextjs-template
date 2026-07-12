#!/usr/bin/env tsx
/**
 * Seeds a local psychologist user for manual dev (web-v1 + space-v1).
 *
 * Usage: pnpm seed:local-users
 */
import { createTestUser } from "@workspace/test-utils/supabase/users"
import { createServiceRoleTestClient } from "@workspace/test-utils/supabase/clients"

const DEV_EMAIL = process.env.LOCAL_DEV_USER_EMAIL ?? "dev.psychologist@fluri.local"
const DEV_PASSWORD = process.env.LOCAL_DEV_USER_PASSWORD ?? "Password123!"

async function main() {
  const admin = await createServiceRoleTestClient()

  const existing = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  const found = existing.data.users.find((user) => user.email === DEV_EMAIL)

  const user =
    found != null
      ? { email: DEV_EMAIL, password: DEV_PASSWORD, userId: found.id }
      : await createTestUser({ email: DEV_EMAIL, password: DEV_PASSWORD })

  const { error: psychologistError } = await admin.from("user_psychologists").upsert(
    {
      id: user.userId,
      display_name: "Dev Psychologist",
      full_name: "Dev Psychologist",
      first_name: "Dev",
      last_name: "Psychologist",
      onboarding_completed: true,
      timezone: "America/Sao_Paulo",
    },
    { onConflict: "id" }
  )

  if (psychologistError) {
    throw psychologistError
  }

  const { error: roleError } = await admin.from("user_roles").upsert(
    {
      role: "psychologist",
      user_id: user.userId,
    },
    { onConflict: "user_id,role" }
  )

  if (roleError) {
    throw roleError
  }

  console.log("")
  console.log("Local dev user ready:")
  console.log(`  email:    ${DEV_EMAIL}`)
  console.log(`  password: ${DEV_PASSWORD}`)
  console.log(`  user id:  ${user.userId}`)
  console.log("")
  console.log("Sign in at http://localhost:3002/en/sign-in")
  console.log("Workspace at http://localhost:3001/en/dashboard")
  console.log("")
}

main().catch((error: unknown) => {
  console.error("seed:local-users failed:", error)
  process.exit(1)
})
