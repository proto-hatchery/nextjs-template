import type { NextRequest } from "next/server"

import { authConfirmGet } from "@workspace/supabase-auth/server/route-handlers/auth-confirm-get"

export async function GET(request: NextRequest) {
  return authConfirmGet(request)
}
