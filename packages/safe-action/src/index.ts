import { createSafeActionClient } from "next-safe-action"

import { getClaims } from "@workspace/supabase-auth/session/get-claims"

const actionClient = createSafeActionClient()

const authActionClient = actionClient.use(async ({ next }) => {
  const claims = await getClaims()

  if (!claims?.sub) {
    throw new Error("Unauthorized")
  }

  return next({ ctx: { userId: claims.sub } })
})

type AuthActionContext = { userId: string }

export { actionClient, authActionClient, type AuthActionContext }
